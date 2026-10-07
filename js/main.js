/* ==========================================================================
   PK IT Sol landing page: interactions (no dependencies)
   1. Brand injection      5. Carousels          9. Contact form
   2. Header & mobile nav  6. FAQ accordion
   3. Scroll helpers       7. Scroll reveal     10. Portfolio (SEO results, web mockups)
   4. Tabs                 8. Feature cards & proposal forms
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");   // also set inline in <head> to avoid a flash

  var CFG = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  /* 1. BRAND INJECTION ----------------------------------------------------- */
  function applyBrand() {
    var social = CFG.social || {};
    var phone = CFG.phone || "";
    var waDigits = (CFG.whatsapp || phone).replace(/\D/g, "");
    var waText = CFG.whatsappMessage ? "?text=" + encodeURIComponent(CFG.whatsappMessage) : "";

    var text = {
      name: CFG.name,
      nameUpper: CFG.name ? CFG.name.toUpperCase() : "",
      tagline: CFG.tagline,
      taglineUpper: CFG.tagline ? CFG.tagline.toUpperCase() : "",
      phone: CFG.phoneDisplay || phone,
      email: CFG.email,
      address: CFG.address
    };
    var links = {
      phone: phone ? "tel:" + phone.replace(/[^\d+]/g, "") : "",
      email: CFG.email ? "mailto:" + CFG.email : "",
      whatsapp: waDigits ? "https://wa.me/" + waDigits + waText : "",
      facebook: social.facebook,
      instagram: social.instagram,
      linkedin: social.linkedin
    };

    $$("[data-brand]").forEach(function (el) {
      var value = text[el.getAttribute("data-brand")];
      if (value) el.textContent = value;
    });
    $$("[data-brand-link]").forEach(function (el) {
      var value = links[el.getAttribute("data-brand-link")];
      if (value) el.setAttribute("href", value);
      else el.hidden = true;                       // e.g. a social profile that is not set yet
    });
    if (CFG.name) {
      $$("[data-brand-alt]").forEach(function (el) { el.alt = CFG.name; });
      $$("[data-brand-label]").forEach(function (el) { el.setAttribute("aria-label", CFG.name + ", back to top"); });
    }

    var map = $("[data-brand-map]");
    var query = CFG.mapQuery || CFG.address;
    if (map && query) {
      var src = "https://www.google.com/maps?q=" + encodeURIComponent(query) + "&output=embed";
      if (map.getAttribute("src") !== src) map.setAttribute("src", src);
    }

    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // Structured data for search engines, built from the same settings
    if (CFG.name) {
      var ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: CFG.name,
        slogan: CFG.tagline,
        telephone: phone,
        email: CFG.email,
        address: CFG.address,
        url: location.origin + location.pathname,
        sameAs: [social.facebook, social.instagram, social.linkedin].filter(Boolean)
      });
      document.head.appendChild(ld);
    }
  }

  /* 2. HEADER & MOBILE NAV ------------------------------------------------- */
  function initHeader() {
    var header = $("[data-header]");
    var toggle = $("[data-nav-toggle]");
    var menu = $("#mobile-menu");
    if (!header || !toggle || !menu) return;

    function setOpen(open) {
      menu.hidden = !open;
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    toggle.addEventListener("click", function () { setOpen(menu.hidden); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (e) { if (e.matches) setOpen(false); });
  }

  /* 3. SCROLL HELPERS (sticky shadow, back-to-top button) ------------------- */
  function initScroll() {
    var header = $("[data-header]");
    var toTop = $(".fab--top");
    var ticking = false;

    function update() {
      ticking = false;
      if (header) header.classList.toggle("is-stuck", window.scrollY > 4 && header.getBoundingClientRect().top <= 0);
      if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 500);
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* 4. TABS (industries, portfolio, why choose us) -------------------------- */
  function initTabs() {
    $$("[data-tabs]").forEach(function (root) {
      var tabs = $$('[role="tab"]', root);

      function select(tab, moveFocus) {
        tabs.forEach(function (t) {
          var active = t === tab;
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
          t.tabIndex = active ? 0 : -1;
          if (panel) panel.hidden = !active;
        });
        if (moveFocus) tab.focus();
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { select(tab, false); });
        tab.addEventListener("keydown", function (e) {
          var next = null;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (e.key === "Home") next = tabs[0];
          else if (e.key === "End") next = tabs[tabs.length - 1];
          if (next) { e.preventDefault(); select(next, true); }
        });
      });
    });
  }

  /* 5. CAROUSELS ------------------------------------------------------------ */
  // Slides per view and gap come from the CSS variables --per-view and --gap,
  // so breakpoints stay in the stylesheet.
  function Carousel(root) {
    var viewport = $(".carousel__viewport", root);
    var track = $(".carousel__track", root);
    var slides = $$(".carousel__slide", root);
    var dotsWrap = $("[data-carousel-dots]", root);
    var prevBtn = $("[data-carousel-prev]", root);
    var nextBtn = $("[data-carousel-next]", root);
    var delay = reduceMotion ? 0 : parseInt(root.getAttribute("data-autoplay"), 10) || 0;
    var index = 0, pages = 1, timer = null, dots = [];
    if (!viewport || !track || !slides.length) return;

    function perView() {
      return Math.max(1, parseInt(getComputedStyle(root).getPropertyValue("--per-view"), 10) || 1);
    }
    function step() {
      return slides[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
    }
    function render() {
      track.style.transform = "translate3d(" + (-index * step()) + "px,0,0)";
      dots.forEach(function (dot, i) { dot.setAttribute("aria-current", String(i === index)); });
      var visible = perView();
      slides.forEach(function (slide, i) {
        var shown = i >= index && i < index + visible;
        slide.setAttribute("aria-hidden", String(!shown));
        if ("inert" in slide) slide.inert = !shown;
      });
    }
    function go(i) {
      index = (i + pages) % pages;
      render();
    }
    function build() {
      var count = Math.max(1, slides.length - perView() + 1);
      if (count !== pages || !dots.length) {
        pages = count;
        if (dotsWrap) {
          dotsWrap.innerHTML = "";
          dots = [];
          for (var i = 0; i < pages; i++) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", "Show slide " + (i + 1) + " of " + pages);
            dot.addEventListener("click", go.bind(null, i));
            dotsWrap.appendChild(dot);
            dots.push(dot);
          }
          dotsWrap.hidden = pages < 2;
        }
      }
      index = Math.min(index, pages - 1);
      track.classList.add("is-dragging");            // skip the transition while re-measuring
      render();
      void track.offsetWidth;
      track.classList.remove("is-dragging");
    }

    function play() {
      stop();
      if (delay && pages > 1) timer = window.setInterval(function () { go(index + 1); }, delay);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    if (prevBtn) prevBtn.addEventListener("click", function () { go(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(index + 1); });

    // Swipe / drag
    var startX = 0, startY = 0, dx = 0, dragging = false, pointerId = null;
    viewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.target.closest("button, a")) return;
      pointerId = e.pointerId; startX = e.clientX; startY = e.clientY; dx = 0; dragging = false;
    });
    viewport.addEventListener("pointermove", function (e) {
      if (e.pointerId !== pointerId) return;
      dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - startY)) {
        dragging = true;
        track.classList.add("is-dragging");
        try { viewport.setPointerCapture(pointerId); } catch (err) { /* older browsers */ }
      }
      if (dragging) track.style.transform = "translate3d(" + (-index * step() + dx) + "px,0,0)";
    });
    function endDrag(e) {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
      if (dx < -50 && index < pages - 1) go(index + 1);
      else if (dx > 50 && index > 0) go(index - 1);
      else render();
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === "ArrowRight") go(index + 1);
    });

    // Autoplay pauses while the visitor is interacting or the tab is hidden
    root.addEventListener("pointerenter", stop);
    root.addEventListener("pointerleave", play);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", play);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });

    // Re-measure on resize and when a hidden tab panel becomes visible
    if ("ResizeObserver" in window) new ResizeObserver(build).observe(viewport);
    else window.addEventListener("resize", build);

    build();
    play();
  }

  /* 6. FAQ ACCORDION -------------------------------------------------------- */
  function initAccordion() {
    $$("[data-accordion]").forEach(function (root) {
      var buttons = $$(".faq__q", root);
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var open = button.getAttribute("aria-expanded") !== "true";
          buttons.forEach(function (b) {
            var on = b === button && open;
            b.setAttribute("aria-expanded", String(on));
            b.closest(".faq__item").classList.toggle("is-open", on);
          });
        });
      });
    });
  }

  /* 7. SCROLL REVEAL -------------------------------------------------------- */
  function initReveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* 8. FEATURE CARDS & PROPOSAL FORMS --------------------------------------- */
  function prefillContact(subject, message) {
    var form = $("[data-contact-form]");
    if (!form) return;
    if (subject) form.elements.subject.value = subject;
    if (message) form.elements.message.value = message;
    var target = $("#contact");
    if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.setTimeout(function () { form.elements.name.focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
  }

  function initFeatureCards() {
    var touch = window.matchMedia("(hover: none)");

    $$("[data-feature-card]").forEach(function (card) {
      // Hover reveals the overlay on desktop; on touch screens a tap toggles it
      card.addEventListener("click", function (e) {
        if (e.target.closest(".proposal")) return;
        if (touch.matches) {
          card.classList.toggle("is-open");
          if (!card.classList.contains("is-open")) card.blur();
        }
      });
      card.addEventListener("keydown", function (e) {
        if (e.target === card && e.key === "Escape") { card.classList.remove("is-open"); card.blur(); }
      });
    });

    $$("[data-proposal]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var service = form.getAttribute("data-proposal");
        var website = form.elements.website.value.trim();
        prefillContact(
          "Proposal request: " + service,
          (website ? "Website: " + website + "\n" : "") + "Please send me a proposal for " + service + ".\n\n"
        );
      });
    });

    $$("[data-quote]").forEach(function (link) {
      link.addEventListener("click", function () {
        var form = $("[data-contact-form]");
        if (form && !form.elements.subject.value) form.elements.subject.value = "Quote request";
      });
    });
  }

  /* 9. CONTACT FORM --------------------------------------------------------- */
  function initContactForm() {
    var form = $("[data-contact-form]");
    if (!form) return;
    var status = $("[data-form-status]", form);
    // Service pages set a default subject: <form data-contact-form data-subject="SEO Services inquiry">
    if (form.getAttribute("data-subject") && !form.elements.subject.value) form.elements.subject.value = form.getAttribute("data-subject");
    var button = $('button[type="submit"]', form);
    var label = button.textContent;

    function say(message, kind) {
      status.className = "form-status" + (kind ? " is-" + kind : "");
      status.textContent = message;
    }
    function invalid(field, message) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
      say(message, "error");
    }

    form.addEventListener("input", function (e) { e.target.removeAttribute("aria-invalid"); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var data = {
        name: f.name.value.trim(),
        email: f.email.value.trim(),
        subject: f.subject.value.trim(),
        message: f.message.value.trim()
      };

      if (f.company_website.value) return;                                  // spam trap
      if (!data.name) return invalid(f.name, "Enter your name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return invalid(f.email, "Enter a valid email address, like name@example.com.");
      if (!data.message) return invalid(f.message, "Write a short message so we know how to help.");

      if (!CFG.formEndpoint) {
        // No backend configured: hand the message to the visitor's email app
        var subject = data.subject || "Website inquiry from " + data.name;
        var body = data.message + "\n\n" + data.name + "\n" + data.email;
        window.location.href = "mailto:" + (CFG.email || "") +
          "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        say("Your email app is opening with the message ready to send. If nothing opens, email us at " + (CFG.email || "our address above") + ".", "success");
        return;
      }

      button.disabled = true;
      button.textContent = "Sending...";
      say("");
      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      }).then(function (response) {
        if (!response.ok) throw new Error("Request failed: " + response.status);
        form.reset();
        say("Message sent. We will reply to " + data.email + " soon.", "success");
      }).catch(function () {
        say("The message could not be sent. Check your connection and try again, or email " + (CFG.email || "us") + " directly.", "error");
      }).then(function () {
        button.disabled = false;
        button.textContent = label;
      });
    });
  }

  /* 10. PORTFOLIO (built from SITE_CONFIG.portfolio) ------------------------ */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function prettyUrl(url) {
    return String(url).trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  }
  function withFallback(img, remote, placeholder) {
    if (remote) img.setAttribute("data-remote", remote);
    if (placeholder) img.setAttribute("data-placeholder", placeholder);
    img.onerror = function () { if (window.imgFallback) window.imgFallback(img); };
    return img;
  }

  // SEO tab: one slide per project, "Real Result" opens the ranking table
  function renderSeoProjects() {
    var track = $('[data-portfolio="seo"]');
    var projects = (CFG.portfolio && CFG.portfolio.seo) || [];
    if (!track) return;

    projects.forEach(function (project, i) {
      var slide = el("li", "carousel__slide");
      var card = el("article", "project");
      var media = el("div", "project__media");
      var img = withFallback(el("img"), project.remote, "assets/img/result-seo.svg");
      img.alt = project.title + " search performance graph";
      img.loading = "lazy";
      img.src = project.image || project.remote || "assets/img/result-seo.svg";
      media.appendChild(img);

      var button = el("button", "project__link", "Real Result");
      button.type = "button";
      button.addEventListener("click", function () { openResult(i); });

      card.appendChild(media);
      card.appendChild(el("h4", "", project.title));
      card.appendChild(button);
      slide.appendChild(card);
      track.appendChild(slide);
    });
  }

  function openResult(index) {
    var dialog = $("[data-result-dialog]");
    var project = ((CFG.portfolio && CFG.portfolio.seo) || [])[index];
    if (!dialog || !project) return;

    $("[data-result-title]", dialog).textContent = project.title;
    $("[data-result-project]", dialog).hidden = !project.link;
    if (project.link) $("[data-result-link]", dialog).href = project.link;

    var image = $("[data-result-image]", dialog);
    image.removeAttribute("data-tried-remote");
    image.removeAttribute("data-tried-placeholder");
    withFallback(image, project.remote, "assets/img/result-seo.svg");
    image.alt = project.title + " search performance graph";
    image.src = project.image || project.remote || "assets/img/result-seo.svg";

    var rows = project.rows || [];
    var body = $("[data-result-rows]", dialog);
    body.textContent = "";
    rows.forEach(function (row, n) {
      var tr = el("tr");
      tr.appendChild(el("td", "", n + 1));
      tr.appendChild(el("td", "", row.keyword));

      var rankCell = el("td");
      if (row.proof) {
        var proof = el("a", "result__rank", row.rank);
        proof.href = row.proof; proof.target = "_blank"; proof.rel = "noopener";
        proof.setAttribute("aria-label", "Rank " + row.rank + " for " + row.keyword + ", open proof");
        rankCell.appendChild(proof);
      } else rankCell.textContent = row.rank;
      tr.appendChild(rankCell);

      var urlCell = el("td");
      if (row.url) {
        var link = el("a", "", prettyUrl(row.url));
        link.href = row.url.trim(); link.target = "_blank"; link.rel = "noopener";
        urlCell.appendChild(link);
      }
      tr.appendChild(urlCell);
      body.appendChild(tr);
    });
    $("[data-result-table-wrap]", dialog).hidden = !rows.length;

    dialog.setAttribute("data-project", project.title);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog.scrollTop = 0;
  }

  function initResultDialog() {
    var dialog = $("[data-result-dialog]");
    if (!dialog) return;
    function close() { if (dialog.open) dialog.close(); }
    $("[data-result-close]", dialog).addEventListener("click", close);
    dialog.addEventListener("click", function (e) { if (e.target === dialog) close(); });   // click on the backdrop
    $("[data-result-proposal]", dialog).addEventListener("click", function (e) {
      e.preventDefault();
      var title = dialog.getAttribute("data-project") || "";
      close();
      prefillContact("Proposal request: SEO Services", "I saw your results for " + title + ". Please send me a proposal for my website.\n\n");
    });
  }

  // Web tab: a laptop + phone mockup per URL, screenshots fetched from the
  // service set in SITE_CONFIG.screenshot
  function screenshotUrl(template, url) {
    return String(template || "").replace("{url}", encodeURIComponent(url)).replace("{rawurl}", url);
  }

  function loadShot(img, src, screen) {
    var tries = 0, maxTries = 8;
    img.onload = function () {
      // mShots answers with a 400x300 "generating" image while it works: ask again shortly
      if (img.naturalWidth === 400 && img.naturalHeight === 300 && /mshots/.test(src) && tries < maxTries) {
        tries++;
        window.setTimeout(function () { img.src = src + (src.indexOf("?") > -1 ? "&" : "?") + "retry=" + tries; }, 3500);
        return;
      }
      screen.classList.add("is-loaded");
    };
    img.onerror = function () { img.onerror = null; screen.classList.add("is-failed"); };
    img.src = src;
  }

  function buildScreen(src, label, alt) {
    var screen = el("span", "mockup__screen");
    screen.appendChild(el("span", "mockup__label", label));
    var img = el("img");
    img.alt = alt;
    img.loading = "lazy";
    screen.appendChild(img);
    loadShot(img, src, screen);
    return screen;
  }

  function renderWebProjects() {
    var grid = $('[data-portfolio="web"]');
    var projects = (CFG.portfolio && CFG.portfolio.web) || [];
    var shots = CFG.screenshot || {};
    if (!grid) return;

    projects.forEach(function (project) {
      if (!project || !project.url) return;
      var domain = prettyUrl(project.url).split("/")[0];
      var title = project.title || domain;

      var card = el("a", "mockup");
      card.href = project.url; card.target = "_blank"; card.rel = "noopener";
      card.setAttribute("aria-label", title + ", open " + domain + " in a new tab");

      var stage = el("span", "mockup__stage");
      var desktop = el("span", "mockup__desktop");
      var bar = el("span", "mockup__bar");
      bar.appendChild(el("i")); bar.appendChild(el("i")); bar.appendChild(el("i"));
      bar.appendChild(el("span", "mockup__url", domain));
      desktop.appendChild(bar);
      desktop.appendChild(buildScreen(project.image || screenshotUrl(shots.desktop, project.url), domain, title + " website on desktop"));
      stage.appendChild(desktop);

      var mobileSrc = project.mobileImage || (shots.mobile ? screenshotUrl(shots.mobile, project.url) : "");
      if (project.phone !== false && mobileSrc) {
        var phone = el("span", "mockup__phone");
        phone.appendChild(buildScreen(mobileSrc, "", ""));
        stage.appendChild(phone);
      }

      card.appendChild(stage);
      card.appendChild(el("span", "mockup__title", title));
      card.appendChild(el("span", "mockup__domain", domain));
      grid.appendChild(card);
    });
  }

  /* BOOT -------------------------------------------------------------------- */
  function init() {
    applyBrand();
    initHeader();
    initScroll();
    initTabs();
    renderSeoProjects();                              // must run before the carousels are measured
    renderWebProjects();
    $$("[data-carousel]").forEach(Carousel);
    initAccordion();
    initReveal();
    initFeatureCards();
    initContactForm();
    initResultDialog();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
