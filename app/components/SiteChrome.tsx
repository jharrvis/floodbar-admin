'use client'

import { trackOpenAILeadCreated } from '@/lib/openaiAds'
import './site-chrome.css'

const WA_NAYKA = 'https://wa.me/6289504656116?text=Halo,%20saya%20tertarik%20dengan%20FloodBar%20custom%20untuk%20rumah%20saya'
const WA_SISKA = 'https://wa.me/6285794313420'

export function SiteHeader() {
  return (
    <div className="chrome">
      <div className="topbar">Terpasang di 443+ lokasi &middot; Harga otomatis sesuai ukuran pintu &middot; Admin AI 24 jam<span className="d-only"> &middot; Produksi sendiri di Kudus</span></div>
      <header>
        <div className="wrap header-in">
          <a className="logo" href="/"><img src="/images/landing/logo.png" alt="Floodbar" /><span>Flood<span className="bar">Bar</span></span></a>
          <nav className="main">
            <a href="/#harga">Harga</a>
            <a href="/#cara-kerja" className="d-only">Cara kerja</a>
            <a href="/#bukti">Bukti</a>
            <a href="/#garansi" className="d-only">Garansi</a>
            <a href="/#faq">FAQ</a>
            <a href="/artikel">Artikel</a>
            <a className="btn d-only" href={WA_NAYKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener">Chat Admin</a>
          </nav>
        </div>
      </header>
    </div>
  )
}

export function SiteFooter() {
  return (
    <div className="chrome">
      <footer className="site-footer">
        <div className="foot-in">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="logo" href="/"><img src="/images/landing/logo.png" alt="Floodbar" /><span>Flood<span className="bar">Bar</span></span></a>
              <p>Sekat pintu anti banjir custom ukuran, diproduksi sendiri dan bisa dipasang sendiri tanpa teknisi.</p>
              <p>Workshop: Jl. Soekarno Hatta, Ngembal Kulon, Kec. Jati, Kabupaten Kudus, Jawa Tengah 59341</p>
            </div>
            <div className="foot-col">
              <h4>Menu</h4>
              <a href="/#harga">Harga</a>
              <a href="/#cara-kerja">Cara kerja</a>
              <a href="/#bukti">Bukti</a>
              <a href="/#garansi">Garansi</a>
              <a href="/#faq">FAQ</a>
              <a href="/artikel">Artikel</a>
            </div>
            <div className="foot-col">
              <h4>Layanan</h4>
              <a href="/order">Pesan Sekarang</a>
              <a href="/order-status">Cek Status Pesanan</a>
              <a href="/#harga">Hitung Harga</a>
            </div>
            <div className="foot-col">
              <h4>Hubungi Admin</h4>
              <a href={WA_NAYKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener"><b>Admin Nayka (AI)</b> — 24 jam<br />0895-0465-6116</a>
              <a href={WA_SISKA} onClick={trackOpenAILeadCreated} target="_blank" rel="noopener"><b>Admin Siska</b> — Senin–Sabtu 08.00–16.00 WIB<br />0857-9431-3420</a>
            </div>
          </div>
          <div className="foot-bottom">&copy; {new Date().getFullYear()} FloodBar.id — Sekat pintu anti banjir custom. Diproduksi di Kudus, Jawa Tengah.</div>
        </div>
      </footer>
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
