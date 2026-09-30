(function () {
  /* Event lead WhatsApp untuk LP Ruko (index2.html).
     - Mengirim event `lead_created` ke dataLayer (GTM/GA4) + CustomEvent untuk OpenAI Pixel.
     - Menyertakan URL + parameter UTM/opreff apa adanya (dipertahankan, tidak diubah).
     - Pixel/ID cukup dipasang sekali di website utama; file ini hanya memicu event. */
  function getParams() {
    var out = {};
    try {
      new URLSearchParams(window.location.search).forEach(function (v, k) { out[k] = v; });
    } catch (e) { /* abaikan browser lama */ }
    return out;
  }

  function fireLead(anchor) {
    var params = getParams();
    var url = new URL(anchor.href, window.location.href);
    Object.keys(params).forEach(function (key) { url.searchParams.set(key, params[key]); });
    anchor.href = url.toString();
    var detail = { page: window.location.pathname, params: params, link_url: anchor.href };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "lead_created", page: detail.page, params: detail.params, link_url: detail.link_url });
    window.dispatchEvent(new CustomEvent("lead_created", { detail: detail }));
    if (typeof window.oaiq === "function") window.oaiq("track", "lead_created", detail);
    if (typeof window.gtag === "function") {
      window.gtag("event", "whatsapp_click", { page_path: detail.page, link_url: detail.link_url, ...detail.params });
    }
  }

  document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
    a.addEventListener("click", function () { fireLead(a); });
  });
})();
