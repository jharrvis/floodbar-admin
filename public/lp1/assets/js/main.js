(function () {
  var trackingKeys = ["oppref", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  function trackWhatsAppClick(link) {
    var url = new URL(link.href, window.location.href);
    var query = new URLSearchParams(window.location.search);
    trackingKeys.forEach(function (key) {
      var value = query.get(key);
      if (value) url.searchParams.set(key, value);
    });
    link.href = url.toString();

    var params = { link_url: link.href, page_location: window.location.href, page_title: document.title };
    trackingKeys.forEach(function (key) {
      var value = query.get(key);
      if (value) params[key] = value;
    });
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "whatsapp_click", ...params });
    if (typeof window.gtag === "function") window.gtag("event", "whatsapp_click", params);
    if (typeof window.oaiq === "function") window.oaiq("track", "lead_created", params);
  }

  document.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
    link.addEventListener("click", function () { trackWhatsAppClick(link); });
  });

  var menu = document.querySelector(".menu");
  var mobile = document.querySelector(".mobile-menu");

  if (menu && mobile) {
    menu.addEventListener("click", function () {
      var open = mobile.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
      menu.textContent = open ? "×" : "☰";
    });

    mobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobile.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
        menu.textContent = "☰";
      });
    });
  }

  /* ---------- Galeri lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightbox-img");
  var lbCaption = document.getElementById("lightbox-caption");
  var prevBtn = lb.querySelector("[data-prev]");
  var nextBtn = lb.querySelector("[data-next]");
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item img"));
  var index = 0;
  var lastFocused = null;

  if (!items.length) return;

  function show(i) {
    index = (i + items.length) % items.length;
    var img = items[index];
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = img.parentElement.querySelector("figcaption").textContent;
    prevBtn.hidden = items.length < 2;
    nextBtn.hidden = items.length < 2;
  }

  function open(i) {
    show(i);
    lb.hidden = false;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(function () { lb.querySelector("[data-close]").focus(); }, 30);
  }

  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    window.setTimeout(function () { lb.hidden = true; }, 260);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  items.forEach(function (img, i) {
    img.parentElement.addEventListener("click", function () {
      lastFocused = img.parentElement;
      open(i);
    });
  });

  items.forEach(function (img, i) {
    var fig = img.parentElement;
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        lastFocused = img.parentElement;
        open(i);
      }
    });
  });

  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.hasAttribute("data-close")) close();
  });

  prevBtn.addEventListener("click", function () { show(index - 1); });
  nextBtn.addEventListener("click", function () { show(index + 1); });

  document.addEventListener("keydown", function (e) {
    if (lb.getAttribute("aria-hidden") === "true") return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "Tab") {
      var focusables = [lb.querySelector("[data-close]"), prevBtn, nextBtn]
        .filter(function (b) { return !b.hidden; });
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
