async function loadTodayFromCSV(csvPath) {
  const text = await fetchText(csvPath);
  const rows = parseCSV(text);
  const today = fmtDateISO();
  // Accept date as YYYY-MM-DD or DD/MM/YYYY
  const row = rows.find(r => {
    const raw = (r.date || r.Date || "").trim();
    if (!raw) return false;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw === today;
    const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const iso = `${m[3]}-${m[2]}-${m[1]}`;
      return iso === today;
    }
    return false;
  });
  if (!row) return null;

  return {
    fajr: row.fajr || row.Fajr || "",
    sunrise: row.sunrise || row.Sunrise || "",
    dhuhr: row.dhuhr || row.Dhuhr || "",
    asr: row.asr || row.Asr || "",
    maghrib: row.maghrib || row.Maghrib || "",
    isha: row.isha || row.Isha || "",
    jummah1: row.jummah1 || row.Jummah1 || row.jummah || row.Jummah || "",
    jummah2: row.jummah2 || row.Jummah2 || ""
  };
}

function renderPrayerTimes(times) {
  const row = document.getElementById("prayer-row");
  if (!times) {
    row.innerHTML = `<tr><td colspan="6" class="text-muted">No timetable entry for today.</td></tr>`;
    return;
  }
  row.innerHTML = `
    <tr>
      <td>${times.fajr || "-"}</td>
      <td>${times.sunrise || "-"}</td>
      <td>${times.dhuhr || "-"}</td>
      <td>${times.asr || "-"}</td>
      <td>${times.maghrib || "-"}</td>
      <td>${times.isha || "-"}</td>
    </tr>
  `;
  const j = document.getElementById("jummah-times");
  const list = [times.jummah1, times.jummah2].filter(Boolean);
  j.textContent = list.length ? `Jumu’ah: ${list.join(" & ")}` : "";
}
