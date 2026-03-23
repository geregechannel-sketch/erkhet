(function () {
  const data = window.SITE_DATA;
  const LANGS = ["mn", "en", "zh", "ru"];
  let lang = localStorage.getItem("lang") || "mn";

  const text = (key) => {
    const dict = data.i18n[lang] || {};
    const en = data.i18n.en[key];
    const mn = data.i18n.mn[key];
    return dict[key] || en || mn || key;
  };

  const val = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    return v[lang] || v.en || v.mn || "";
  };

  const setLang = (next) => {
    lang = LANGS.includes(next) ? next : "mn";
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    paint();
  };

  const renderHeader = (page) => {
    const el = document.getElementById("site-header");
    if (!el) return;
    const nav = data.nav
      .map((item) => `<a class="${item.page === page ? "active" : ""}" href="${item.href}">${text(item.key)}</a>`)
      .join("");
    el.className = "site-header";
    el.innerHTML = `
      <div class="container nav">
        <a class="brand" href="index.html">
          <img src="${data.company.logo}" alt="logo">
          <span>${text("brand.short")}</span>
        </a>
        <nav class="menu">${nav}</nav>
        <div class="lang-switch">
          ${LANGS.map((x) => `<button data-lang="${x}" class="${x === lang ? "active" : ""}">${x.toUpperCase()}</button>`).join("")}
        </div>
      </div>
    `;
    el.querySelectorAll("button[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  };

  const renderFooter = () => {
    const el = document.getElementById("site-footer");
    if (!el) return;
    const year = new Date().getFullYear();
    el.className = "site-footer";
    el.innerHTML = `
      <div class="container footer-grid">
        <div>
          <h4>${text("brand.full")}</h4>
          <p>${text("home.heroSubtitle")}</p>
        </div>
        <div>
          <h4>${text("nav.contact")}</h4>
          <ul class="footer-list">
            <li><a href="tel:${data.company.phone}">${data.company.phoneLabel}</a></li>
            <li><a href="mailto:${data.company.email}">${data.company.email}</a></li>
            <li><a href="${data.links.facebook}" target="_blank" rel="noopener">Facebook</a></li>
          </ul>
        </div>
        <div>
          <h4>${text("contact.methods")}</h4>
          <ul class="footer-list">${data.payment.methods.map((m) => `<li>${m}</li>`).join("")}</ul>
        </div>
      </div>
      <div class="container copyright">© ${year} ${text("brand.full")} - ${text("footer.rights")}</div>
    `;
  };

  const applyText = () => {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = text(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", text(el.dataset.i18nPlaceholder));
    });
  };

  const renderHome = () => {
    const services = document.getElementById("home-services");
    if (services) {
      services.innerHTML = data.services.slice(0, 4).map((s) => `
        <article class="card"><div class="content">
          <p>${s.icon}</p><h3>${val(s.title)}</h3><p class="meta">${val(s.desc)}</p>
        </div></article>`).join("");
    }

    const tours = document.getElementById("home-featured-tours");
    if (tours) {
      const list = data.featuredTourIds.map((id) => data.tours.find((t) => t.id === id)).filter(Boolean);
      tours.innerHTML = list.map((t) => `
        <article class="card">
          <img class="cover" src="${t.image}" alt="${val(t.title)}">
          <div class="content">
            <span class="badge">${val(t.duration)}</span>
            <h3>${val(t.title)}</h3>
            <p class="meta">${val(t.route)}</p>
            ${t.price ? `<p class="price">${t.price}</p>` : ""}
            <a class="text-link" href="tour-detail.html?id=${t.id}">${text("common.details")}</a>
          </div>
        </article>`).join("");
    }

    const regions = document.getElementById("home-regions");
    if (regions) {
      regions.innerHTML = data.destinations.map((r) => `
        <article class="card"><div class="content">
          <h3>${val(r.title)}</h3>
          <ul class="feature-list">${r.items.slice(0, 5).map((x) => `<li>${x}</li>`).join("")}</ul>
          <a class="text-link" href="destinations.html">${text("common.details")}</a>
        </div></article>`).join("");
    }

    const values = document.getElementById("home-values");
    if (values) {
      values.innerHTML = data.values.map((v) => `<article class="card"><div class="content"><p>${val(v)}</p></div></article>`).join("");
    }
  };

  const renderAbout = () => {
    const founded = document.getElementById("about-founded");
    if (founded) founded.textContent = data.company.founded;
    const mission = document.getElementById("about-mission-text");
    if (mission) mission.textContent = val(data.mission);
    const dir = document.getElementById("about-directions");
    if (dir) dir.innerHTML = data.businessDirections.map((d) => `<li>${val(d)}</li>`).join("");
    const values = document.getElementById("about-values");
    if (values) values.innerHTML = data.values.map((v) => `<li>${val(v)}</li>`).join("");
  };

  const renderServices = () => {
    const target = document.getElementById("services-list");
    if (!target) return;
    target.innerHTML = data.services.map((s) => `<article class="card"><div class="content"><h3>${s.icon} ${val(s.title)}</h3><p class="meta">${val(s.desc)}</p></div></article>`).join("");
  };

  const renderTours = () => {
    const holder = document.getElementById("tours-list");
    if (!holder) return;
    const filter = document.getElementById("tour-filter");
    const query = (document.getElementById("tour-search")?.value || "").toLowerCase().trim();
    const mode = filter ? filter.value : "all";
    const list = data.tours.filter((t) => (mode === "all" || t.category === mode)).filter((t) => {
      const textBlob = `${val(t.title)} ${val(t.route)} ${val(t.overview)}`.toLowerCase();
      return !query || textBlob.includes(query);
    });
    holder.innerHTML = list.length
      ? list.map((t) => `
        <article class="card">
          <img class="cover" src="${t.image}" alt="${val(t.title)}">
          <div class="content">
            <span class="badge">${val(t.duration)}</span>
            <h3>${val(t.title)}</h3>
            <p class="meta">${val(t.route)}</p>
            ${t.price ? `<p class="price">${t.price}</p>` : ""}
            <a class="text-link" href="tour-detail.html?id=${t.id}">${text("common.details")}</a>
          </div>
        </article>`).join("")
      : `<div class="card"><div class="content">${text("tours.none")}</div></div>`;
  };

  const renderTourDetail = () => {
    const title = document.getElementById("detail-title");
    if (!title) return;
    const id = new URLSearchParams(window.location.search).get("id");
    const tour = data.tours.find((t) => t.id === id) || data.tours[0];
    title.textContent = val(tour.title);
    document.getElementById("detail-image").src = tour.image;
    document.getElementById("detail-duration").textContent = val(tour.duration);
    document.getElementById("detail-price").textContent = tour.price || "-";
    document.getElementById("detail-route").textContent = val(tour.route);
    document.getElementById("detail-overview").textContent = val(tour.overview);
    document.getElementById("detail-itinerary").innerHTML = tour.itinerary.map((x) => `<div class="itinerary-item">${x}</div>`).join("");
  };

  const renderDestinations = () => {
    const holder = document.getElementById("dest-list");
    if (!holder) return;
    holder.innerHTML = data.destinations.map((r) => `
      <article class="card"><div class="content">
        <h3>${val(r.title)}</h3>
        <ul class="feature-list">${r.items.map((x) => `<li>${x}</li>`).join("")}</ul>
      </div></article>
    `).join("");
  };

  const renderContact = () => {
    const root = document.getElementById("official-contact");
    if (root) {
      const parts = [
        `<p><strong>${text("contact.phone")}:</strong> <a href="tel:${data.company.phone}">${data.company.phoneLabel}</a></p>`,
        `<p><strong>Email:</strong> <a href="mailto:${data.company.email}">${data.company.email}</a></p>`,
        `<p><strong>Facebook:</strong> <a href="${data.links.facebook}" target="_blank" rel="noopener">${data.links.facebook}</a></p>`
      ];
      if (data.company.address) {
        parts.push(`<p><strong>Address:</strong> ${data.company.address}</p>`);
      }
      root.innerHTML = parts.join("");
    }

    const payment = document.getElementById("payment-info");
    if (payment) {
      payment.innerHTML = `
        <p><strong>${text("contact.methods")}:</strong> ${data.payment.methods.join(", ")}</p>
        ${data.payment.instructions ? `<p><strong>${text("contact.instructions")}:</strong> ${data.payment.instructions}</p>` : ""}
      `;
    }

    const qr = document.getElementById("qr-info");
    if (qr) {
      qr.innerHTML = `
        <figure><img src="${data.links.telegramQr}" alt="Telegram QR"><figcaption>Telegram</figcaption></figure>
        <figure><img src="${data.links.wechatQr}" alt="WeChat QR"><figcaption>WeChat</figcaption></figure>
      `;
    }

    const form = document.getElementById("enquiry-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const message = [
          "Enquiry request",
          `Name: ${formData.get("name") || ""}`,
          `Phone: ${formData.get("phone") || ""}`,
          `Email: ${formData.get("email") || ""}`,
          `Tour: ${formData.get("tour") || ""}`,
          `People: ${formData.get("people") || ""}`,
          `Days: ${formData.get("days") || ""}`,
          `Note: ${formData.get("note") || ""}`
        ].join("\n");
        window.open(data.links.facebook, "_blank");
        alert(message);
        form.reset();
      });
    }
  };

  const paint = () => {
    const page = document.body.dataset.page || "home";
    renderHeader(page);
    renderFooter();
    applyText();
    renderHome();
    renderAbout();
    renderServices();
    renderTours();
    renderTourDetail();
    renderDestinations();
    renderContact();
  };

  window.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("input", (e) => {
      if (e.target.id === "tour-search") renderTours();
    });
    document.addEventListener("change", (e) => {
      if (e.target.id === "tour-filter") renderTours();
    });
    paint();
  });
})();
