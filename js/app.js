import { getPrayerData } from './prayers.js';
const j = jamaah ? `<div class="small text-muted">Jama’ah: ${jamaah}</div>` : '';
return `<div class="col"><div class="card h-100"><div class="card-body">
<div class="small text-muted">${name}</div>
<div class="fs-4">${time||'-'}</div>
${j}
</div></div></div>`;
}


(async () => {
const { cfg, date, timings, jamaah, source } = await getPrayerData();


// Header & footer
el('name').textContent = cfg.name;
el('name-foot').textContent = cfg.name;
el('year').textContent = new Date().getFullYear();
el('address').textContent = cfg.address || '';
if (cfg.brand?.logo) el('logo').src = cfg.brand.logo;
const phone = cfg.contacts?.phone; if (phone) { el('phone').textContent = phone; el('phone').href = `tel:${phone}`; }
const email = cfg.contacts?.email; if (email) { el('email').textContent = email; el('email').href = `mailto:${email}`; }


// Prayers
el('today').textContent = date;
const names = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
const grid = names.filter(n => n!=='Sunrise').map(n => card(n, timings[n], jamaah?.[n]));
document.getElementById('prayers').innerHTML = grid.join('');
if (cfg.jummah_times?.length) {
el('jummah').textContent = `Jumu’ah: ${cfg.jummah_times.join(' & ')}`;
}
el('prayer-note').textContent = source === 'csv' ? 'Times from local timetable.' : 'Times from public API.';


// Announcements
const anns = await loadJSON('/data/announcements.json') || [];
anns.sort((a,b) => (b.pin - a.pin) || (b.start?.localeCompare(a.start)) || 0);
const ul = document.getElementById('announcements');
if (!anns.length) ul.innerHTML = '<li class="list-group-item">No announcements right now.</li>';
anns.forEach(a => {
const dates = a.start ? (a.end && a.end!==a.start ? `${a.start} – ${a.end}` : a.start) : '';
const pin = a.pin ? '<span class="badge text-bg-warning ms-2">Pinned</span>' : '';
const li = document.createElement('li');
li.className = 'list-group-item';
li.innerHTML = `<strong>${a.title}</strong>${pin}<div class="small text-muted mb-1">${dates}</div><div>${a.body}</div>`;
ul.appendChild(li);
});


// Gallery
const gal = await loadJSON('/data/gallery.json') || [];
const g = document.getElementById('gallery');
gal.forEach(x => {
const col = document.createElement('div'); col.className = 'col';
col.innerHTML = `<div class="card h-100"><img src="${x.src}" class="card-img-top" alt="${x.alt||''}"><div class="card-body"><div class="small">${x.caption||''}</div></div></div>`;
g.appendChild(col);
});


// Links
const links = await loadJSON('/data/links.json') || {};
const linkMap = { donations: 'Donate', facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', website: 'Website' };
const l = document.getElementById('links');
Object.entries(linkMap).forEach(([k,label]) => {
if (!links[k]) return;
const li = document.createElement('li'); li.className = 'list-inline-item me-3';
li.innerHTML = `<a href="${links[k]}" target="_blank" rel="noopener">${label}</a>`;
l.appendChild(li);
});
})();
