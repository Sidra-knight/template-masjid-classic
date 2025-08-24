// prayers.js — API + CSV fallback (no secrets)
const row = rows.find(r => r.date === y);
if (!row) throw new Error('No row for today');
return {
source: 'csv',
date: y,
timings: {
Fajr: row.fajr_begin,
Sunrise: row.sunrise,
Dhuhr: row.dhuhr_begin,
Asr: row.asr_begin,
Maghrib: row.maghrib_begin,
Isha: row.isha_begin
},
jamaah: {
Fajr: row.fajr_jamaah,
Dhuhr: row.dhuhr_jamaah,
Asr: row.asr_jamaah,
Maghrib: row.maghrib_jamaah,
Isha: row.isha_jamaah
}
};
}


async function getApiTimes(cfg) {
const school = cfg.madhab === 'Hanafi' ? 1 : 0;
const url = `https://api.aladhan.com/v1/timings?latitude=${cfg.location.lat}&longitude=${cfg.location.lng}&method=${encodeURIComponent(cfg.calculation_method)}&school=${school}&timezonestring=${encodeURIComponent(cfg.timezone)}`;
const res = await fetch(url);
const data = await res.json();
const t = data.data.timings;
const date = data.data.date.readable;
return {
source: 'api',
date,
timings: { Fajr: t.Fajr, Sunrise: t.Sunrise, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha },
jamaah: null
};
}


export async function getPrayerData() {
const cfg = await loadJSON('data/config.json');
const useCsv = await headExists('data/timetable.csv');
try {
const result = useCsv ? await getCsvTimes('data/timetable.csv', cfg.timezone) : await getApiTimes(cfg);
return { cfg, ...result };
} catch (e) {
console.error(e);
const api = await getApiTimes(cfg); // fallback on failure
return { cfg, ...api };
}
}
