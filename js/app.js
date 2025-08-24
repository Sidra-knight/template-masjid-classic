(async function () {
  try {
    const cfg = await fetchJSON("data/config.json");

    // Brand
    document.getElementById("site-title").textContent = cfg.name || "Masjid";
    document.getElementById("brand-name").textContent = cfg.name || "Masjid";
    if (cfg.brand && cfg.brand.logo) {
      document.getElementById("brand-logo").src = cfg.brand.logo; // e.g. assets/logo.svg
    }

    // Contacts & links
    if (cfg.contacts?.email) {
      const el = document.getElementById("contact-email");
      el.classList.remove("d-none");
      el.href = `mailto:${cfg.contacts.email}`;
      el.textContent = cfg.contacts.email;
    }
    if (cfg.contacts?.phone) {
      const el = document.getElementById("contact-phone");
      el.classList.remove("d-none");
      el.href = `tel:${cfg.contacts.phone}`;
      el.textContent = cfg.contacts.phone;
    }
    if (cfg.links?.donate) {
      const el = document.getElementById("links-donate");
      el.classList.remove("d-none");
      el.href = cfg.links.donate;
    }
    document.getElementById("address").textContent = cfg.address || "";

    // Today label — safe against bad tz
    document.getElementById("today-label").textContent = formatTodaySafe(cfg.timezone);

    // Announcements (safe)
    const anns = await fetchJSON("data/announcements.json").catch(() => []);
    renderAnnouncements(anns);

    // Gallery (safe)
    const gallery = await fetchJSON("data/gallery.json").catch(() => []);
    renderGallery(gallery);

    // Prayer times CSV (safe)
    let times = null;
    try {
      times = await loadTodayFromCSV("data/timetable.csv");
    } catch (e) {
      console.warn("timetable.csv missing or invalid:", e);
    }
    renderPrayerTimes(times);
  } catch (e) {
    console.error(e);
  }
})();

function renderAnnouncements(items) {
  const wrap = document.getElementById("ann-list");
  if (!Array.isArray(items) || !items.length) {
    wrap.innerHTML = `<div class="col-12 text-muted">No announcements.</div>`;
    return;
  }
  const now = new Date();
  wrap.innerHTML = items
    .filter(a => {
      const startOk = !a.start || new Date(a.start) <= now;
      const endOk = !a.end || new Date(a.end) >= now;
      return startOk && endOk;
    })
    .sort((a,b) => ((b.pin?1:0)-(a.pin?1:0)) || (new Date(b.start||0) - new Date(a.start||0)))
    .map(a => `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card announcement h-100">
          <div class="card-body">
            <div class="d-flex align-items-start justify-content-between">
              <h3 class="h6 m-0">${escapeHTML(a.title || "Announcement")}</h3>
              ${a.pin ? '<span class="badge text-bg-light badge-pin">Pinned</span>' : ''}
            </div>
            ${a.date ? `<div class="text-muted small mt-1">${escapeHTML(a.date)}</div>` : ''}
            <p class="mt-2 mb-0">${escapeHTML(a.body || "")}</p>
          </div>
        </div>
      </div>
    `).join("");
}

function renderGallery(items) {
  const g = document.getElementById("gallery");
  if (!Array.isArray(items) || !items.length) {
    g.innerHTML = `<span class="text-muted">No images yet.</span>`;
    return;
  }
  g.innerHTML = items.map(it => `
    <img src="${encodeURI(it.src)}" alt="${escapeHTML(it.alt || "")}" title="${escapeHTML(it.caption || "")}" style="height:96px;width:auto;border-radius:.5rem">
  `).join("");
}

function formatTodaySafe(tz) {
  const opts = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  try {
    if (tz) return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: tz }).format(new Date());
  } catch (e) {
    console.warn("Invalid timezone in config:", tz);
  }
  return new Intl.DateTimeFormat(undefined, opts).format(new Date());
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
