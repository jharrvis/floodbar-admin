'use client'

import { useEffect, useRef, useState } from 'react'
import { trackOpenAILeadCreated } from '@/lib/openaiAds'
import './landing-baru.css'

const WA_NAYKA = 'https://wa.me/6289504656116?text=Halo,%20saya%20tertarik%20dengan%20FloodBar%20custom%20untuk%20rumah%20saya'
const WA_SISKA = 'https://wa.me/6285794313420'

const FAQ_ITEMS = [
  { q: 'Berapa tinggi air yang bisa ditahan?', a: 'Sesuai tinggi sekat yang Anda pesan, mulai 10 cm hingga 120 cm, dan bisa dibuat lebih tinggi lagi. Untuk sekat di atas 120 cm, konsultasikan dulu dengan admin.' },
  { q: 'Apakah benar-benar tidak rembes?', a: 'Floodbar dirancang sebagai penghalang fisik untuk membantu mencegah air banjir masuk, dengan plat galvanis dan rangka besi yang kokoh. Efektivitasnya bergantung pada ketepatan ukuran, kerapatan pemasangan, kondisi permukaan pintu, dan ketinggian dan tekanan air.' },
  { q: 'Pintu saya tidak standar / lantainya miring. Bisa?', a: 'Bisa dikonsultasikan dulu dengan admin. Kirim foto lokasi, kondisi pintu, dan hasil ukur agar tim kami bantu menilai kebutuhan Anda.' },
  { q: 'Berapa lama produksi dan pengiriman?', a: 'Produksi 3–10 hari kerja (tergantung ukuran dan jumlah), lalu QC dan packing ±1 hari kerja. Setelah diserahkan ke ekspedisi: Pulau Jawa ±7 hari kerja, luar Jawa ±14–30 hari kerja. Ingin pakai ekspedisi tertentu? Konfirmasi dulu ke Admin Siska.' },
  { q: 'Bisa pasang sendiri?', a: 'Bisa. Pemasangan dirancang mudah tanpa teknisi, cukup ikuti video tutorial. Ada kendala? Admin siap memandu.' },
  { q: 'Bayarnya bagaimana?', a: 'Pesan lewat admin (dapat panduan pembayaran) atau checkout langsung di floodbar.id. Ketentuan DP atau pelunasan mengikuti informasi saat pemesanan.' },
  { q: 'Kalau saya salah ukur?', a: 'Segera hubungi admin sebelum pesanan masuk produksi agar dicek ulang. Jika produk sudah diproduksi, perubahan ukuran bisa memerlukan biaya dan waktu tambahan. Salah ukur dari customer tidak termasuk garansi.' },
]

export default function HomePage() {
  const [hasil, setHasil] = useState('Rp –')
  const [hasilSub, setHasilSub] = useState('Isi lebar dan tinggi, lalu tekan Hitung Harga.')
  const [orderDims, setOrderDims] = useState<{ w: number; h: number } | null>(null)
  const [articles, setArticles] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/articles?published=true')
      .then((r) => r.json())
      .then((res) => {
        const rows = (res && res.data) || []
        const sorted = rows.slice().sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        setArticles(sorted.slice(0, 3))
      })
      .catch(() => {})
  }, [])
  const [openFaq, setOpenFaq] = useState(0)
  const lebarRef = useRef<HTMLInputElement>(null)
  const tinggiRef = useRef<HTMLInputElement>(null)

  // Rumus yang sama dengan API kalkulator situs: lebar x tinggi x Rp170
  // plus biaya packing Rp40.000 per unit (unit = ceil(dimensi terbesar / 100 cm)).
  function hitungHarga() {
    const w = parseFloat(lebarRef.current?.value || '')
    const h = parseFloat(tinggiRef.current?.value || '')
    if (!w || !h || w <= 0 || h <= 0) {
      setHasil('Rp –')
      setHasilSub('Isi lebar dan tinggi, lalu tekan Hitung Harga.')
      setOrderDims(null)
      return
    }
    if (h < 10) {
      setHasil('Rp –')
      setHasilSub('Tinggi minimal 10 cm. Isi tinggi 10 cm atau lebih, lalu tekan Hitung Harga.')
      setOrderDims(null)
      return
    }
    const total = w * h * 170 + Math.ceil(Math.max(w, h) / 100) * 40000
    setHasil('Rp' + Math.round(total).toLocaleString('id-ID'))
    setHasilSub('Untuk pintu ' + w + ' × ' + h + ' cm. Estimasi belum termasuk ongkir — harga final dikonfirmasi saat pemesanan.')
    setOrderDims({ w, h })
  }

  return (
    <div className="lp">


{/* ===== TOPBAR ===== */}
<div className="topbar">Terpasang di 443+ lokasi &middot; Harga otomatis sesuai ukuran pintu &middot; Admin AI 24 jam<span className="d-only"> &middot; Produksi sendiri di Kudus</span></div>

{/* ===== HEADER ===== */}
<header>
  <div className="wrap header-in">
    <a className="logo" href="/"><img src="/images/landing/logo.png" alt="Floodbar" /><span>Flood<span className="bar">Bar</span></span></a>
    <nav className="main">
      <a href="#harga">Harga</a>
      <a href="#cara-kerja" className="d-only">Cara kerja</a>
      <a href="#bukti">Bukti</a>
      <a href="#garansi" className="d-only">Garansi</a>
      <a href="#faq">FAQ</a>
      <a href="/artikel">Artikel</a>
      <a className="btn d-only" href={WA_NAYKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener">Chat Admin</a>
    </nav>
  </div>
</header>

{/* ===== HERO ===== */}
<section className="hero">
  <div className="wrap hero-grid">
    <div className="hero-main">
      <div className="eyebrow">Sekat Pintu Anti Banjir &middot; Custom Ukuran</div>
      <h1>Banjir datang, air berhenti di depan pintu.</h1>
      <p className="lead">Floodbar dibuat pas sesuai ukuran pintu Anda dan bisa dipasang sendiri. Untuk rumah, toko, ruko, gudang, dan kantor.</p>
    </div>
    <div className="hero-photo"><img src="/images/landing/hero.jpg" alt="Floodbar terpasang menahan air banjir di depan pintu" /></div>
    <div className="hero-side">
      <div className="checks-row d-only">
        <span><svg className="check-ic" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Custom ukuran</span>
        <span><svg className="check-ic" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Plat galvanis + rangka besi</span>
        <span><svg className="check-ic" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Pasang sendiri</span>
      </div>
      <div className="price-line"><span className="contoh"><span className="d-only">Contoh: pintu 60 &times; 50 cm</span><span className="m-only">Contoh: pintu lebar 60 cm, tinggi 50 cm</span></span><span className="price-big">Rp550.000</span></div>
      <ul className="checks-list m-only">
        <li><svg className="check-ic" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Dibuat sesuai ukuran pintu Anda</li>
        <li><svg className="check-ic" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Plat galvanis + rangka besi</li>
        <li><svg className="check-ic" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>Pasang sendiri, ada video tutorial</li>
      </ul>
      <div className="hero-ctas">
        <a className="btn" href={WA_NAYKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>Chat Admin, Kirim Ukuran Pintu</a>
        <a className="btn outline" href="#harga"><span className="d-only">Hitung harga sendiri</span><span className="m-only">Atau hitung harga sendiri</span></a>
      </div>
      <p className="hero-note">Dijawab 24 jam oleh Admin AI Nayka &middot; Admin Siska Senin&ndash;Sabtu 08.00&ndash;16.00 WIB</p>
    </div>
  </div>
</section>

{/* ===== STATS ===== */}
<div className="stats">
  <div className="wrap stats-grid">
    <div className="stat"><b>443+</b><span>lokasi sudah terpasang</span></div>
    <div className="stat"><b>120+ cm</b><span>tinggi air yang bisa ditahan, sesuai pesanan</span></div>
    <div className="stat"><b>Min. 10 cm</b><span>tinggi sekat, bisa disesuaikan</span></div>
    <div className="stat"><b>3&ndash;10 hari</b><span>kerja waktu produksi</span></div>
  </div>
</div>

{/* ===== HARGA ===== */}
<section className="section light" id="harga">
  <div className="wrap harga-grid">
    <div>
      <div className="eyebrow">Harga</div>
      <h2>Hitung Harga Floodbar Anda</h2>
      <p className="d-only">Harga Floodbar menyesuaikan ukuran pintu. Masukkan ukuran pintu Anda untuk mengetahui estimasi harga secara otomatis.</p>
      <p className="d-only">Satu sistem harga untuk rumah, toko, ruko, garasi, maupun gudang.</p>
      <p className="m-only">Harga Floodbar menyesuaikan ukuran pintu. Masukkan ukuran pintu Anda untuk mengetahui estimasi harga secara otomatis. Satu sistem harga untuk rumah, toko, ruko, garasi, maupun gudang.</p>
      <p className="harga-note d-only">Estimasi belum termasuk ongkir. Harga final dikonfirmasi saat pemesanan.</p>
    </div>
    <div>
      <div className="calc-card">
        <div className="calc-fields">
          <div>
            <label htmlFor="in-lebar">Lebar pintu (cm)</label>
            <input ref={lebarRef} type="number" inputMode="numeric" min="1" placeholder="Contoh: 90" />
          </div>
          <div>
            <label htmlFor="in-tinggi">Tinggi sekat (cm)</label>
            <input ref={tinggiRef} type="number" inputMode="numeric" min="10" placeholder="Contoh: 50" />
          </div>
        </div>
        <p className="calc-help"><span className="d-only">Tinggi minimal 10 cm, bisa lebih dari 120 cm. Pilih sesuai tinggi air banjir di lokasi Anda.</span><span className="m-only">Minimal 10 cm, bisa lebih dari 120 cm. Pilih sesuai tinggi air banjir di lokasi Anda.</span></p>
        <button className="btn navy" type="button" onClick={hitungHarga}>Hitung Harga</button>
        <div className="calc-result">
          <div className="lbl">Estimasi harga Floodbar</div>
          <div className="val">{hasil}</div>
          <div className="sub">{hasilSub}</div>
          {orderDims && (<a className="btn order-now" href={`/order?width=${orderDims.w}&height=${orderDims.h}`}>Order Sekarang</a>)}
        </div>
      </div>
      <p className="harga-note m-only">Estimasi belum termasuk ongkir. Harga final dikonfirmasi saat pemesanan.</p>
    </div>
  </div>
</section>

{/* ===== KENAPA PERLU ===== */}
<section className="section dark">
  <div className="wrap kenapa-grid">
    <div>
      <div className="eyebrow on-dark">Kenapa Perlu</div>
      <h2>Sekali air masuk, yang rusak bukan cuma lantai.</h2>
      <ul className="dash-list">
        <li>&mdash; Kasur, sofa, dan lemari menyerap air</li>
        <li>&mdash; Kulkas, mesin cuci, stop kontak terendam</li>
        <li>&mdash; Bersih-bersih lumpur berhari-hari</li>
      </ul>
      <div className="callout">Kerugiannya bisa jutaan. Floodbar mulai <b>ratusan ribu</b>, dan dipakai lagi setiap musim hujan.</div>
    </div>
    <div className="compare d-only">
      <table>
        <thead><tr><th>Karung pasir</th><th>Tembok / tanggul</th><th className="fb">Floodbar</th></tr></thead>
        <tbody>
          <tr><td>Berat, kotor, air tetap rembes</td><td>Permanen, perlu tukang, ganggu jalan masuk</td><td className="fb">Plat galvanis kokoh, bisa lepas-pasang</td></tr>
          <tr><td>Disiapkan saat panik</td><td>Jutaan rupiah</td><td className="fb">Mulai ratusan ribu, pasang sendiri</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

{/* ===== BANDINGKAN (mobile) ===== */}
<section className="section light m-only" style={{ paddingTop: 52 }}>
  <div className="wrap">
    <div className="eyebrow">Bandingkan</div>
    <h2>Karung pasir, tembok, atau Floodbar?</h2>
    <div className="compare">
      <table>
        <thead><tr><th>Karung pasir</th><th>Tembok / tanggul</th><th className="fb">Floodbar</th></tr></thead>
        <tbody>
          <tr><td>Berat, kotor, air tetap rembes</td><td>Permanen, perlu tukang, ganggu jalan masuk</td><td className="fb">Plat galvanis kokoh, bisa lepas-pasang</td></tr>
          <tr><td>Disiapkan saat panik</td><td>Jutaan rupiah</td><td className="fb">Mulai ratusan ribu, pasang sendiri</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

{/* ===== CARA KERJA ===== */}
<section className="section" id="cara-kerja" style={{ paddingTop: 76 }}>
  <div className="wrap kerja-grid">
    <div className="kerja-head">
      <div className="eyebrow">Cara Kerja</div>
      <h2>Penghalang fisik di jalur masuk air</h2>
      <p>Floodbar mencegah atau meminimalkan air banjir masuk ke bangunan lewat pintu, gerbang, atau akses masuk lainnya.</p>
    </div>
    <div className="kerja-photo"><img src="/images/landing/panel-merah.jpg" alt="Floodbar warna merah terpasang di pintu" /></div>
    <div className="kerja-steps">
      <ol className="steps">
        <li><span className="step-n">1</span><p><b>Pemasangan.</b> Dipasang di jalur masuk air: pintu rumah, toko, gudang, atau bangunan lain.</p></li>
        <li><span className="step-n">2</span><p><b>Penghalang air.</b> Saat banjir, plat galvanis menahan aliran air agar tidak langsung masuk.</p></li>
        <li><span className="step-n">3</span><p><b>Kekuatan struktur.</b> Rangka besi menopang Floodbar menghadapi tekanan air.</p></li>
        <li><span className="step-n">4</span><p><b>Perlindungan bangunan.</b> Risiko air masuk dan kerusakan barang berkurang.</p></li>
      </ol>
      <p className="material"><b>Material Produk:</b> Plat Galvanis dan Rangka Besi.</p>
      <p className="disclaimer">Efektivitas bergantung pada ketinggian dan tekanan air, ketepatan ukuran, serta kerapatan pemasangan.</p>
      <div className="tutorial-block">
        <div className="tutorial-label">Video Tutorial Pemasangan</div>
        <video controls preload="none" poster="/images/landing/poster-tutorial.jpg" src="/videos/video-tutorial-pemasangan.mp4" />
        <p className="tutorial-cap">Bracket disekrup ke kusen (sekrup sudah disediakan), lalu sekat tinggal dimasukkan ke bracket. Bisa pasang sendiri tanpa teknisi.</p>
      </div>
    </div>
  </div>
</section>

{/* ===== BUKTI ===== */}
<section className="section light" id="bukti">
  <div className="wrap">
    <div className="bukti-head">
      <div>
        <div className="eyebrow">Bukti</div>
        <h2>Sudah dipakai rumah, ruko, sampai dapur MBG</h2>
      </div>
      <a className="btn d-only" href={WA_NAYKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener">Tanya Harga Pintu Saya</a>
    </div>
    <div className="bukti-grid">
      <a className="video-card" href="https://www.youtube.com/shorts/wOHYxURCmrw" target="_blank" rel="noopener">
        <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
        <p><span className="d-only">Video demo Floodbar (YouTube Shorts, putar di halaman)</span><span className="m-only">Video demo Floodbar (YouTube Shorts wOHYxURCmrw, putar di halaman)</span></p>
      </a>
      <div className="b-card">
        <img className="shot" src="/images/landing/wa-wiwin.jpg" alt="Chat WhatsApp pelanggan Wiwin dari Bekasi" />
        <div className="b-body">
          <div className="b-name">Wiwin &middot; Bekasi</div>
          <p className="b-text"><span className="d-only">Dipasang di depan rumah. Setelah unboxing: &ldquo;Alhamdulillah semuanya aman.&rdquo;</span><span className="m-only">Dipasang di depan rumah. Setelah unboxing, ia mengirim video pemasangan: &ldquo;Alhamdulillah semuanya aman.&rdquo;</span></p>
        </div>
      </div>
      <div className="b-card">
        <img className="shot" src="/images/landing/wa-jennifer.jpg" alt="Chat WhatsApp pelanggan Jennifer dari Tangerang" />
        <div className="b-body">
          <div className="b-name">Jennifer &middot; Tangerang</div>
          <p className="b-text">Dipasang di ruko dengan total lebar 7,75 meter.</p>
        </div>
      </div>
      <div className="repeat-card">
        <div className="eyebrow">Repeat Order</div>
        <div className="repeat-nums">
          <div className="num"><b>1</b><small>sekat</small></div>
          <div className="arrow">&rarr;</div>
          <div className="num"><b>28</b><small>sekat</small></div>
        </div>
        <div className="b-name">Putri &middot; Medan</div>
        <p className="b-text"><span className="d-only">September 2026 pesan 1 sekat untuk kamar mandi, lalu kembali order 28 sekat untuk dapur MBG-nya.</span><span className="m-only">September 2026 pesan 1 sekat untuk kamar mandi. Setelah cocok, kembali order 28 sekat untuk dapur MBG-nya.</span></p>
      </div>
    </div>
    <a className="btn m-only bukti-cta-mobile" style={{ width: "100%" }} href={WA_NAYKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener">Chat Admin, Tanya Harga Pintu Saya</a>
  </div>
</section>

{/* ===== CARA PESAN ===== */}
<section className="section">
  <div className="wrap pesan-grid">
    <div>
      <div className="eyebrow">Cara Pesan</div>
      <h2>Pesan lewat 2 cara</h2>
      <div className="cara-cards">
        <a className="cara-card" href={WA_NAYKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener">
          <div className="c-eyebrow">CARA 1</div>
          <h3>Chat admin</h3>
          <p><span className="d-only">Konsultasi, tentukan ukuran, dan dapat panduan pembayaran.</span><span className="m-only">Konsultasi, tentukan ukuran, dan dapat panduan bayar.</span></p>
        </a>
        <a className="cara-card" href="/order">
          <div className="c-eyebrow">CARA 2</div>
          <h3>Checkout di website</h3>
          <p>Isi ukuran dan ikuti tahap checkout di floodbar.id.</p>
        </a>
      </div>
    </div>
    <div className="panduan">
      <h3>Panduan mengukur pintu</h3>
      <img className="info-img" src="/images/landing/infografis.jpg" alt="Infografis langkah-langkah mengukur pintu untuk Floodbar" />
      <ol className="steps">
        <li><span className="step-n">1</span><p><b>Ukur lebar pintu</b> <span className="d-only">dari ujung luar kiri ke ujung luar kanan, di bagian atas dan bawah.</span><span className="m-only">dari ujung luar sisi kiri ke ujung luar sisi kanan. Ukur di bagian atas dan bawah.</span></p></li>
        <li><span className="step-n">2</span><p><b>Tentukan tinggi penghalang</b><span className="d-only">, minimal 10 cm.</span><span className="m-only"> sesuai tingkat perlindungan yang diinginkan. Minimal 10 cm.</span></p></li>
        <li><span className="step-n">3</span><p><b>Catat lebar dan tinggi</b><span className="d-only">, lalu masukkan saat pesan atau kirim ke admin.</span><span className="m-only">, lalu masukkan saat pesan di website atau kirim ke admin.</span></p></li>
      </ol>
      <button className="btn outline" type="button">Tonton video cara mengukur</button>
    </div>
  </div>
</section>

{/* ===== PRODUKSI ===== */}
<section className="section light">
  <div className="wrap produksi-grid">
    <div className="prod-head">
      <div className="eyebrow">Produksi</div>
      <h2>Diproduksi Sendiri di Kudus</h2>
      <p>Floodbar diproduksi sendiri di Kudus, Jawa Tengah, melalui proses pengerjaan dan pemeriksaan kualitas sebelum produk dikirimkan kepada pelanggan.</p>
    </div>
    <div className="prod-photos">
      <img src="/images/landing/workshop-1.jpg" alt="Plat Floodbar di workshop Kudus" />
      <img src="/images/landing/workshop-2.jpg" alt="Rangka dan plat Floodbar di workshop Kudus" />
    </div>
    <div className="prod-videos">
          <video controls preload="none" poster="/images/landing/poster-produksi-1.jpg" src="/videos/video-produksi-1.mp4" />
          <video controls preload="none" poster="/images/landing/poster-produksi-2.jpg" src="/videos/video-produksi-2.mp4" />
        </div>
    <div className="prod-alamat">
      <b>Alamat workshop</b>
      <p>Jl. Soekarno Hatta, Ngembal Kulon, Kec. Jati, Kabupaten Kudus, Jawa Tengah 59341</p>
    </div>
  </div>
</section>

{/* ===== GARANSI ===== */}
<section className="section" id="garansi">
  <div className="wrap">
    <div className="eyebrow">Garansi</div>
    <h2>Garansi Produk 1 &times; 24 Jam</h2>
    <p className="garansi-intro">Setiap produk Floodbar diperiksa sebelum dikirim. Kami memberikan garansi 1 &times; 24 jam sejak produk diterima untuk kerusakan komponen yang menjadi tanggung jawab produksi.</p>
    <div className="g-cards">
      <div className="g-card">
        <div className="g-ic"><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div><h4>Masa berlaku</h4> <p>1 &times; 24 jam sejak produk diterima. Klaim harus diajukan dalam periode ini.</p></div>
      </div>
      <div className="g-card">
        <div className="g-ic"><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
        <div><h4>Video unboxing wajib</h4> <p>Rekam dari paket masih tersegel sampai semua bagian dikeluarkan dan diperiksa.</p></div>
      </div>
      <div className="g-card">
        <div className="g-ic"><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></div>
        <div><h4>Prosedur klaim</h4> <p>Hubungi admin, lampirkan video unboxing serta foto/video bagian yang rusak. Klaim diperiksa dulu oleh tim.</p></div>
      </div>
      <div className="g-card">
        <div className="g-ic"><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
        <div><h4>Penyelesaian</h4> <p>Jika disetujui, kami ganti komponen atau perbaiki produk sesuai jenis kerusakan.</p></div>
      </div>
    </div>
    <div className="tanggung">
      <div>
        <h4>Yang ditanggung</h4>
        <p>Kerusakan yang sudah ada saat barang diterima, misalnya karet seal terlepas atau komponen cacat.</p>
      </div>
      <div>
        <h4>Yang tidak ditanggung</h4>
        <p><span className="d-only">Salah ukur lebar/tinggi oleh customer, ukuran tidak sesuai akibat salah ukur, kesalahan pemasangan, kelalaian atau modifikasi, serta kerusakan setelah produk dipakai atau karena faktor luar.</span><span className="m-only">Kesalahan ukur lebar/tinggi pintu oleh customer, ukuran tidak sesuai akibat salah ukur, kesalahan pemasangan, kelalaian atau modifikasi produk, serta kerusakan setelah produk dipakai atau karena faktor luar.</span></p>
      </div>
    </div>
    <div className="note-bar"><b>Catatan:</b> garansi ini khusus untuk kerusakan produk, bukan jaminan kesesuaian ukuran pintu ataupun hasil pemasangan.</div>
  </div>
</section>

{/* ===== FAQ + CUSTOMER SERVICE ===== */}
<section className="section light" id="faq">
  <div className="wrap faq-grid">
    <div>
      <div className="eyebrow">FAQ</div>
      <h2>Pertanyaan yang sering masuk</h2>
      {FAQ_ITEMS.map((item, i) => (
        <div className={`faq-item${openFaq === i ? " open" : ""}`} key={item.q}>
          <button className="faq-q" type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{item.q}</button>
          <div className="faq-a"><p>{item.a}</p></div>
        </div>
      ))}
    </div>
    <div className="cs">
      <div className="eyebrow">Customer Service</div>
      <h3>Kami siap membantu Anda</h3>
      <div className="cs-card">
        <div className="cs-top">
          <div>
            <div className="cs-name">Admin Nayka (AI)</div>
            <div className="cs-hours">24 jam, setiap hari</div>
          </div>
          <span className="badge">Selalu aktif</span>
        </div>
        <a className="btn" href={WA_NAYKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener">Chat 0895&ndash;0465&ndash;6116</a>
      </div>
      <div className="cs-card">
        <div className="cs-top">
          <div>
            <div className="cs-name">Admin Siska</div>
            <div className="cs-hours">Senin&ndash;Sabtu, 08.00&ndash;16.00 WIB</div>
          </div>
        </div>
        <a className="btn" href={WA_SISKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener">Chat 0857&ndash;9431&ndash;3420</a>
      </div>
      <p className="cs-note">Minggu dan tanggal merah Admin Siska libur. Admin Nayka tetap melayani info produk.</p>
    </div>
  </div>
</section>

{/* ===== ARTIKEL ===== */}
{articles.length > 0 && (
<section className="section" id="artikel">
  <div className="wrap">
    <div className="bukti-head">
      <div>
        <div className="eyebrow">Artikel</div>
        <h2>Artikel &amp; Tips</h2>
        <p className="section-sub">Baca artikel terbaru seputar tips perlindungan banjir dan informasi berguna lainnya</p>
      </div>
      <a className="btn outline d-only" href="/artikel">Lihat Semua Artikel</a>
    </div>
    <div className="artikel-grid">
      {articles.map((a) => (
        <a className="artikel-card" href={`/artikel/${a.slug}`} key={a.id}>
          <div className="artikel-img">{a.imageUrl ? <img src={a.imageUrl} alt={a.title} loading="lazy" /> : null}</div>
          <div className="artikel-body">
            <h3>{a.title}</h3>
            <p>{a.excerpt}</p>
            <span className="artikel-more">Baca Selengkapnya &rarr;</span>
          </div>
        </a>
      ))}
    </div>
    <a className="btn outline m-only" style={{ width: "100%" }} href="/artikel">Lihat Semua Artikel</a>
  </div>
</section>
)}

{/* ===== CTA AKHIR ===== */}
<section className="cta-final">
  <div className="wrap cta-grid">
    <div>
      <h2>Musim hujan sudah jalan. Pesan lebih awal, sebelum banjir berikutnya.</h2>
      <p className="sub">Produksi 3&ndash;10 hari kerja, lalu dikirim ke seluruh Indonesia.</p>
      <p className="cta-links">Belum mau chat? <a href="#harga">Hitung harga sendiri</a> &middot; <a href="/order-status">Cek status pesanan</a></p>
    </div>
    <a className="btn" href={WA_NAYKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener">Chat Admin Sekarang</a>
  </div>
</section>

{/* ===== STICKY BAR (mobile) ===== */}
<div className="sticky-bar">
  <div>
    <div className="t1">Sekat banjir custom</div>
    <div className="t2">Harga sesuai ukuran pintu</div>
  </div>
  <a className="btn" href={WA_NAYKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener">Chat Admin</a>
</div>


    </div>
  )
}
