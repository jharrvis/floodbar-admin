const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const ROOT = path.resolve(__dirname, '..')
const articlesDir = path.join(ROOT, 'ARTIKEL')
const mapPath = path.join(articlesDir, 'generated-article-image-map.json')
const author = process.env.ARTICLE_AUTHOR || 'Floodbar.id'
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.floodbar.id').replace(/\/$/, '')
const META_LABEL_RE = /^\*\*(SEO title|Slug|Meta|Meta description|Keyword|Keyword utama|Keyword pendukung|Search intent|Internal link|Internal link yang disarankan):\*\*/i
const BODY_META_RE = /<(p|li|h2|h3)>\s*(?:<strong>)?\s*(SEO title|Slug|Meta|Meta description|Keyword|Keyword utama|Keyword pendukung|Search intent|Internal link|Internal link yang disarankan):/i
const INTERNAL_SLUGS = [
  'apa-itu-sekat-banjir',
  'cara-melindungi-rumah-dari-banjir',
  'cara-memilih-sekat-pintu-anti-banjir',
  'cara-mengukur-pintu-untuk-sekat-banjir',
  'konsultasi-sebelum-membeli-sekat-banjir',
  'jenis-penghalang-banjir',
  'sekat-banjir-rumah-ruko-gudang-pabrik',
  'cara-merawat-sekat-pintu-anti-banjir',
]

function readMap() {
  const entries = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
  return new Map(entries.map((entry) => [entry.slug.replace(/^\/artikel\//, ''), entry]))
}

function inline(text) {
  return text
    .trim()
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

function stripMetadataLines(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => !META_LABEL_RE.test(line.trim()))
    .join('\n')
}

function markdownToHtml(markdown) {
  const out = []
  const lines = stripMetadataLines(markdown).replace(/^---\s*$/gm, '').split(/\r?\n/)
  let paragraph = []
  let list = false
  const flush = () => {
    if (paragraph.length) {
      const html = '<p>' + inline(paragraph.join(' ')) + '</p>'
      if (!BODY_META_RE.test(html)) out.push(html)
      paragraph = []
    }
  }
  const closeList = () => { if (list) { out.push('</ol>'); list = false } }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flush(); closeList(); continue }
    if (/^# /.test(line)) continue
    const h = line.match(/^###?\s+(.+)$/)
    if (h) {
      flush(); closeList()
      const html = '<h2>' + inline(h[1]) + '</h2>'
      if (!BODY_META_RE.test(html)) out.push(html)
      continue
    }
    const item = line.match(/^\d+\.\s+(.+)$/)
    if (item) {
      flush()
      if (!list) { out.push('<ol>'); list = true }
      const html = '<li>' + inline(item[1]) + '</li>'
      if (!BODY_META_RE.test(html)) out.push(html)
      continue
    }
    if (/^\*\*CTA:/i.test(line)) {
      flush(); closeList()
      out.push('<p>' + inline(line.replace(/^\*\*CTA:\*\*\s*/i, '')) + '</p>')
      continue
    }
    if (/^\*\*Internal link(?: yang disarankan)?:/i.test(line)) {
      flush(); closeList()
      continue
    }
    paragraph.push(line)
  }
  flush(); closeList()
  return out.join('\n')
}

function trimEditorialTail(block) {
  return block.split(/\r?\n(?=#{1,3} (?:Peta Internal Link|Pedoman Publikasi|Sumber Editorial|Sumber Rujukan|Catatan Implementasi|Checklist Upload|Rekomendasi)\b)/)[0]
}

function field(block, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp('^\\*\\*' + escaped + ':\\*\\*\\s*(.+)$', 'im')
  const match = block.match(re)
  return match ? match[1].trim().replace(/\s+$/g, '') : null
}

function cleanSlug(value) {
  return value.replace(/^`?\/?artikel\//, '').replace(/`/g, '').trim().replace(/[^a-z0-9-].*$/i, '')
}

function heroAlt(title, keyword) {
  const basis = keyword || title
  return basis.toLowerCase().includes('ukur')
    ? 'Pengukuran bukaan pintu sebelum memesan sekat banjir Floodbar'
    : 'Ilustrasi ' + basis.replace(/[?]/g, '').trim()
}

function relatedSlugs(article, allRecords) {
  const candidates = INTERNAL_SLUGS.filter((slug) => slug !== article.slug && allRecords.some((item) => item.slug === slug))
  const byNumber = allRecords.filter((item) => item.slug !== article.slug).sort((a, b) => Math.abs(a.number - article.number) - Math.abs(b.number - article.number)).map((item) => item.slug)
  return [...new Set([...candidates, ...byNumber])].slice(0, 3)
}

function linkSection(article, allRecords) {
  const lookup = new Map(allRecords.map((item) => [item.slug, item]))
  const links = relatedSlugs(article, allRecords).map((slug) => lookup.get(slug)).filter(Boolean)
  const items = links.map((item) => `<li><a href="/artikel/${item.slug}">${item.title}</a></li>`)
  items.push('<li><a href="/order">Konsultasi ukuran dan kebutuhan Floodbar</a></li>')
  return '<h2>Baca Juga</h2>\n<p>Untuk memahami pilihan perlindungan banjir secara lebih lengkap, lanjutkan ke panduan terkait berikut.</p>\n<ul>\n' + items.join('\n') + '\n</ul>'
}

function parseDrafts() {
  const drafts = []
  for (const file of fs.readdirSync(articlesDir).filter((name) => name.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(articlesDir, file), 'utf8')
    const marker = /^# ARTIKEL \d+/m.test(text) ? /(?=^# ARTIKEL \d+)/m : /(?=^##\s+\d+\.\s+)/m
    for (const rawBlock of text.split(marker).filter((b) => /Slug:\*\*/.test(b))) {
      const block = trimEditorialTail(rawBlock)
      const heading = block.match(/^##\s+(?:\d+\.\s+)?(.+)$/m)
      const slugValue = field(block, 'Slug')
      if (!heading || !slugValue) continue
      const seoTitle = field(block, 'SEO title') || heading[1].trim()
      const metaDescription = field(block, 'Meta description') || field(block, 'Meta') || heading[1].trim()
      const primaryKeyword = field(block, 'Keyword utama') || field(block, 'Keyword') || null
      const secondaryKeywords = field(block, 'Keyword pendukung') || null
      drafts.push({
        title: heading[1].trim(),
        slug: cleanSlug(slugValue),
        excerpt: metaDescription,
        seoTitle,
        metaDescription,
        primaryKeyword,
        secondaryKeywords,
        content: markdownToHtml(block),
        file,
      })
    }
  }
  return drafts
}

function scheduleFor(index) {
  return index < 30 ? new Date(Date.UTC(2026, 7, 20 + index)) : new Date(Date.UTC(2026, 8, 19 + index - 30))
}

function assertClean(records) {
  const dirty = records.filter((article) => BODY_META_RE.test(article.content) || /(Meta|Keyword|SEO title|Search intent):/i.test(article.content))
  if (dirty.length) throw new Error('Metadata labels still present in body: ' + dirty.map((item) => item.slug).slice(0, 10).join(', '))
}

async function main() {
  const apply = process.argv.includes('--apply')
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))
  const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity
  const imageMap = readMap()
  const drafts = parseDrafts()
  const seen = new Set()
  const records = []
  for (const draft of drafts) {
    if (seen.has(draft.slug)) throw new Error('Duplicate slug in drafts: ' + draft.slug)
    seen.add(draft.slug)
    const image = imageMap.get(draft.slug)
    if (!image) throw new Error('No audit/image mapping for slug: ' + draft.slug)
    records.push({ ...draft, id: image.id, number: Number(image.id.slice(3)), imageUrl: image.imageUrl, heroAlt: heroAlt(draft.title, draft.primaryKeyword) })
  }
  records.sort((a, b) => a.number - b.number)
  const selected = records.slice(0, limit)
  for (const article of selected) article.content = article.content + '\n' + linkSection(article, selected)
  assertClean(selected)
  console.log(JSON.stringify({ total: records.length, selected: selected.length, preview: selected.map((a, index) => ({ id: a.id, title: a.title, slug: a.slug, imageUrl: a.imageUrl, scheduledAt: scheduleFor(index).toISOString(), isPublished: scheduleFor(index) <= new Date() })) }, null, 2))
  if (!apply) return
  const prisma = new PrismaClient()
  try {
    for (const [index, article] of selected.entries()) {
      const scheduledAt = scheduleFor(index)
      const existing = await prisma.article.findUnique({ where: { slug: article.slug } })
      const published = Boolean(existing?.isPublished) || scheduledAt <= new Date()
      const data = {
        articleId: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        seoTitle: article.seoTitle,
        metaDescription: article.metaDescription,
        primaryKeyword: article.primaryKeyword,
        secondaryKeywords: article.secondaryKeywords,
        heroAlt: article.heroAlt,
        imageUrl: article.imageUrl,
        author,
        isPublished: published,
        scheduledAt: published ? null : scheduledAt,
        publishedAt: published ? (existing?.publishedAt || scheduledAt) : null,
      }
      if (existing) await prisma.article.update({ where: { id: existing.id }, data })
      else await prisma.article.create({ data })
    }
  } finally {
    await prisma.$disconnect()
  }
  console.log('Imported ' + selected.length + ' articles')
}

main().catch((error) => { console.error(error); process.exit(1) })