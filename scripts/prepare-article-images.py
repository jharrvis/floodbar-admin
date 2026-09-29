import argparse
import json
import re
import shutil
import sys
import tempfile
import unicodedata
from pathlib import Path

import gdown
import pandas as pd
from PIL import Image, ImageOps


PHONE_DEFAULT = "6289504656116"
MAX_WIDTH = 1600
JPEG_QUALITY = 82


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", str(value))
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value


def read_drive_manifest(manifest_dir: Path) -> list[dict]:
    items: list[dict] = []
    for path in sorted(manifest_dir.glob("folder*.json")):
        raw = path.read_bytes()
        for encoding in ("utf-16", "utf-8-sig", "utf-8"):
            try:
                data = json.loads(raw.decode(encoding))
                break
            except UnicodeDecodeError:
                continue
            except json.JSONDecodeError:
                continue
        else:
            raise ValueError(f"Cannot read manifest JSON: {path}")

        for item in data:
            item = dict(item)
            item["manifest"] = path.name
            item["source_path"] = str(item.get("path", ""))
            items.append(item)

    deduped: list[dict] = []
    seen_ids: set[str] = set()
    for item in items:
        file_id = drive_file_id(item.get("url", ""))
        if not file_id or file_id in seen_ids:
            continue
        seen_ids.add(file_id)
        item["drive_file_id"] = file_id
        deduped.append(item)
    return deduped


def drive_file_id(url: str) -> str:
    match = re.search(r"[?&]id=([^&]+)", url)
    return match.group(1) if match else ""


def read_articles(audit_path: Path) -> list[dict]:
    df = pd.read_excel(audit_path, sheet_name="Audit Artikel", header=4)
    df = df[df["ID"].astype(str).str.match(r"^FB-\d{3}$", na=False)]
    articles = []
    for _, row in df.iterrows():
        title = str(row["Judul/H1"]).strip()
        articles.append(
            {
                "id": str(row["ID"]).strip(),
                "title": title,
                "slug": str(row["Slug"]).replace("/artikel/", "").strip("/"),
                "category": str(row.get("Kategori", "")).strip(),
                "intent": str(row.get("Intent", "")).strip(),
                "city": "" if pd.isna(row.get("Kota")) else str(row.get("Kota")).strip(),
            }
        )
    return articles


def score_image(article: dict, item: dict) -> int:
    title = article["title"].lower()
    category = article["category"].lower()
    path = item["source_path"].lower()

    score = 0
    if "watermark/" in path:
        score -= 20
    if path.endswith(".heic"):
        score -= 100

    if "packing" in title or "pengiriman" in title or "kirim" in title:
        score += 40 if "foto packing" in path else 0
    if "gudang" in title or "stok" in title:
        score += 35 if "gudang" in path else 0
    if "pintu" in title or "rumah" in title or "bangunan" in title:
        score += 25 if "sekat pintu jejer" in path else 0
    if "kota" in category or article["city"]:
        score += 20 if "sekat pintu jejer" in path or "desember" in path else 0
    if "beli" in title or "harga" in title or "konsultasi" in title:
        score += 16 if "foto sekat" in path or "foto packing" in path else 0
    if "apa itu" in title or "cara" in title or "panduan" in title:
        score += 12 if "sekat pintu jejer" in path or "foto sekat" in path else 0

    if "foto sekat demaan" in path:
        score += 12
    if "sekat pintu jejer" in path:
        score += 10
    if "desember 2025" in path or "27 november 2025" in path:
        score += 6
    if "/" not in item["source_path"]:
        score += 3

    return score


def choose_images(articles: list[dict], images: list[dict]) -> list[dict]:
    available = [
        item
        for item in images
        if re.search(r"\.(jpe?g|png)$", item["source_path"], re.IGNORECASE)
        and "watermark/" not in item["source_path"].lower()
    ]
    if len(available) < len(articles):
        raise ValueError(f"Need {len(articles)} images, only {len(available)} usable images found")

    title_slug_counts: dict[str, int] = {}
    for article in articles:
        title_slug = slugify(article["title"])
        title_slug_counts[title_slug] = title_slug_counts.get(title_slug, 0) + 1

    used: set[str] = set()
    assignments = []
    for article in articles:
        ranked = sorted(
            (item for item in available if item["drive_file_id"] not in used),
            key=lambda item: (score_image(article, item), item["source_path"]),
            reverse=True,
        )
        selected = ranked[0]
        used.add(selected["drive_file_id"])
        image_slug = slugify(article["title"])
        if title_slug_counts[image_slug] > 1:
            image_slug = f"{image_slug}-{article['id'].lower()}"
        filename = f"{image_slug}-{PHONE_DEFAULT}.jpg"
        assignments.append(
            {
                **article,
                "imageFile": filename,
                "imageUrl": f"/images/artikel/{filename}",
                "driveFileId": selected["drive_file_id"],
                "driveUrl": selected["url"],
                "sourcePath": selected["source_path"],
                "score": score_image(article, selected),
            }
        )
    return assignments


def convert_image(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        elif image.mode == "L":
            image = image.convert("RGB")
        if image.width > MAX_WIDTH:
            ratio = MAX_WIDTH / float(image.width)
            height = max(1, int(image.height * ratio))
            image = image.resize((MAX_WIDTH, height), Image.Resampling.LANCZOS)
        image.save(destination, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)


def download_and_convert(assignments: list[dict], output_dir: Path, force: bool) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="floodbar-article-images-") as tmp:
        tmp_dir = Path(tmp)
        for index, item in enumerate(assignments, start=1):
            destination = output_dir / item["imageFile"]
            if destination.exists() and not force:
                print(f"[skip] {index:03d} {destination.name}")
                continue

            raw_path = tmp_dir / f"{item['driveFileId']}.raw"
            print(f"[download] {index:03d} {item['id']} <- {item['sourcePath']}")
            result = gdown.download(item["driveUrl"], str(raw_path), quiet=True)
            if not result or not raw_path.exists():
                raise RuntimeError(f"Failed to download {item['driveUrl']}")
            convert_image(raw_path, destination)


def write_mapping(assignments: list[dict], mapping_path: Path) -> None:
    mapping_path.parent.mkdir(parents=True, exist_ok=True)
    mapping_path.write_text(json.dumps(assignments, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare FloodBar article images from Google Drive manifests.")
    parser.add_argument("--audit", default="ARTIKEL/audit-seo-110-artikel-floodbar.xlsx")
    parser.add_argument("--manifest-dir", default="tmp-drive-image-review")
    parser.add_argument("--output-dir", default="public/images/artikel")
    parser.add_argument("--mapping", default="ARTIKEL/generated-article-image-map.json")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    audit_path = Path(args.audit)
    manifest_dir = Path(args.manifest_dir)
    output_dir = Path(args.output_dir)
    mapping_path = Path(args.mapping)

    articles = read_articles(audit_path)
    if args.limit:
        articles = articles[: args.limit]

    images = read_drive_manifest(manifest_dir)
    assignments = choose_images(articles, images)
    write_mapping(assignments, mapping_path)

    print(f"Articles: {len(articles)}")
    print(f"Drive images: {len(images)}")
    print(f"Mapping: {mapping_path}")

    if not args.apply:
        print("Dry run only. Re-run with --apply to download and write images.")
        return 0

    if not shutil.which("gdown"):
        print("Warning: gdown command is not on PATH, using Python package import only.", file=sys.stderr)

    download_and_convert(assignments, output_dir, args.force)
    print(f"Output: {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

