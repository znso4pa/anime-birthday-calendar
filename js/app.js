const result = document.getElementById("result");
const resultHead = document.getElementById("resultHead");
const nameInput = document.getElementById("nameInput");
const dateInput = document.getElementById("dateInput");

let allCharacters = [];

async function loadCharacters() {
  try {
    const response = await fetch("./assets/data/characters.json");
    if (!response.ok) throw new Error("网络响应不是 OK");
    const defaultCharacters = await response.json();
    allCharacters = dedupeCharacters([...defaultCharacters, ...getCustomCharacters()]);
    
    const today = todayMMDD();
    dateInput.value = today;
    searchByDate(today);
    
  } catch (error) {
    console.error("加载角色数据失败：", error);
    allCharacters = dedupeCharacters([...getCustomCharacters()]);

    resultHead.textContent =
      "加载角色数据失败，请通过本地 HTTP 服务打开页面（例如 python3 -m http.server），或检查 assets/data/characters.json 是否可访问。";
    result.innerHTML =
      '<div class="empty">未加载默认角色数据，当前搜索将只匹配自定义角色。</div>';
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCards(list) {
  if (!list.length) {
    result.innerHTML = '<div class="empty">没有找到结果。</div>';
    return;
  }

  result.innerHTML = `
    <div class="cards">
      ${list
        .map((c) => {
          const name = escapeHtml(c.name);
          const birthday = escapeHtml(c.birthday || "未知");
          const series = escapeHtml(c.series || "未知");
          const cv = escapeHtml(c.cv || "未知");
          const imageSrc = String(c.image || "").trim();
          const imageTag = imageSrc
            ? `<img src="${escapeHtml(imageSrc)}" alt="${name}" loading="lazy" />`
            : "";
          return `
        <article class="card">
          ${imageTag}
          <div class="meta">
            <div class="name">${name}</div>
            <div class="line">生日：${birthday}</div>
            <div class="line">作品：${series}</div>
            <div class="line">CV：${cv}</div>
          </div>
        </article>
      `;
        })
        .join("")}
    </div>
  `;
}

function searchByName() {
  const keyword = nameInput.value.trim().toLowerCase();
  if (!keyword) {
    resultHead.textContent = "请输入角色名后再查询。";
    result.innerHTML = "";
    return;
  }

  const list = allCharacters.filter((c) => {
    const name = String(c.name || "").toLowerCase();
    const romaji = String(c.romaji || "").toLowerCase();
    return name.includes(keyword) || romaji.includes(keyword);
  });
  resultHead.textContent = `角色名查询：${nameInput.value.trim()}（${list.length} 条）`;
  renderCards(list);
}

function searchByDate(dateText) {
  const mmdd = normalizeDate(dateText);
  if (!mmdd) {
    resultHead.textContent = "日期格式错误，请输入 MM-DD，例如 03-14。";
    result.innerHTML = "";
    return;
  }

  const list = allCharacters.filter((c) => c.birthday === mmdd);
  resultHead.textContent = `日期查询：${mmdd}（${list.length} 条）`;
  renderCards(list);
}

document.getElementById("nameBtn").addEventListener("click", searchByName);
document.getElementById("dateBtn").addEventListener("click", () => {
  searchByDate(dateInput.value);
});
document.getElementById("todayBtn").addEventListener("click", () => {
  const today = todayMMDD();
  dateInput.value = today;
  searchByDate(today);
});

nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchByName();
});
dateInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchByDate(dateInput.value);
});

loadCharacters();
