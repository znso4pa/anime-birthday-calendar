const STORAGE_KEY = "acg_birthdays_custom_characters_v1";

function getCustomCharacters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function saveCustomCharacters(list) {
  const safe = Array.isArray(list) ? list : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
}
