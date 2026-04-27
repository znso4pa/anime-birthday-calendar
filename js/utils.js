function normalizeDate(value) {
  const raw = String(value || "").trim().replace("/", "-").replace(".", "-");
  if (!raw) return "";

  const hit = raw.match(/^(\d{1,2})-(\d{1,2})$/);
  if (!hit) return "";

  const mm = hit[1].padStart(2, "0");
  const dd = hit[2].padStart(2, "0");
  const month = +mm;
  const day = +dd;

  if (month < 1 || month > 12) return "";
  if (day < 1) return "";

  const maxDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > maxDays[month - 1]) return "";

  return `${mm}-${dd}`;
}

function todayMMDD() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function dedupeCharacters(list) {
  const map = new Map();
  list.forEach((item) => {
    if (!item || !item.name || !item.birthday) return;
    const key = `${String(item.name).trim()}#${String(item.birthday).trim()}`;
    if (!map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
}
