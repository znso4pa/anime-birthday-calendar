const result = document.getElementById("result");
const resultHead = document.getElementById("resultHead");
const nameInput = document.getElementById("nameInput");
const dateInput = document.getElementById("dateInput");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxMessage = document.getElementById("lightboxMessage");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxSubtitle = document.getElementById("lightboxSubtitle");

let allCharacters = [];
const MAX_RESULTS = 100;

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

function openLightbox(src, alt, title, subtitle, message) {
  lightbox.classList.add("visible");
  lightbox.setAttribute("aria-hidden", "false");
  lightboxTitle.textContent = title || "图片预览";
  lightboxSubtitle.textContent = subtitle || "点击背景或 Esc 关闭";

  if (message) {
    lightboxImage.style.display = "none";
    lightboxMessage.textContent = message;
    lightboxMessage.classList.add("visible");
    lightboxImage.src = "";
    lightboxImage.alt = "";
  } else {
    lightboxImage.style.display = "block";
    lightboxMessage.textContent = "";
    lightboxMessage.classList.remove("visible");
    lightboxImage.src = src;
    lightboxImage.alt = alt || "";
  }
}

function closeLightbox() {
  lightbox.classList.remove("visible");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxMessage.textContent = "";
  lightboxMessage.classList.remove("visible");
}

function renderCards(list) {
  if (!list.length) {
    result.innerHTML = '<div class="empty">没有找到结果。</div>';
    return;
  }

  const displayList = list.length > MAX_RESULTS ? list.slice(0, MAX_RESULTS) : list;
  const truncated = list.length > MAX_RESULTS;

  result.innerHTML = `
    <div class="cards">
      ${displayList
        .map((c) => {
          const name = escapeHtml(c.name);
          const birthday = escapeHtml(c.birthday || "未知");
          const series = escapeHtml(c.series || "未知");
          const cv = escapeHtml(c.cv || "未知");
          const imageSrc = String(c.image || "").trim();
          const imageTag = imageSrc
            ? `<img src="${escapeHtml(imageSrc)}" alt="${name}" loading="lazy" class="card-image" onclick="openLightbox('${escapeHtml(imageSrc)}', '${escapeHtml(name)}', '${escapeHtml(name)}', '生日：${escapeHtml(birthday)} · 作品：${escapeHtml(series)} · CV：${escapeHtml(cv)}')" />`
            : `<div class="card-image-missing" onclick="openLightbox('', '', '唉呀～没有找到图片呢', '是时候该告诉笨笨的制作者了', '唉呀～没有找到图片呢，是时候该告诉笨笨的制作者了')">唉呀～没有找到图片呢<br>是时候该告诉笨笨的制作者了</div>`;
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
    ${truncated ? `<div class="truncate-tip">已显示前${MAX_RESULTS}条结果。请输入更精确的关键词以查看更多匹配项。</div>` : ""}
  `;
}

function searchByName(isPrefix = false) {
  const inputValue = nameInput.value.trim();
  if (!inputValue) {
    resultHead.textContent = "请输入角色名后再查询。";
    result.innerHTML = "";
    return;
  }

  const keyword = inputValue.toLowerCase();
  const hasChinese = /[\u4e00-\u9fff]/.test(inputValue);
  const validAscii = /^[a-z]{2,}$/.test(keyword);

  if (!hasChinese && !validAscii) {
    resultHead.textContent = "请输入至少两个英文字母或一个中文汉字进行搜索。";
    result.innerHTML = "";
    return;
  }

  const list = allCharacters.filter((c) => {
    const name = String(c.name || "").toLowerCase();
    const romaji = String(c.romaji || "").toLowerCase();
    return isPrefix
      ? name.startsWith(keyword) || romaji.startsWith(keyword)
      : name.includes(keyword) || romaji.includes(keyword);
  });

  const modeText = isPrefix ? "前缀查询" : "角色名查询";
  const countText = list.length > MAX_RESULTS ? `，仅显示前${MAX_RESULTS}条` : "";
  resultHead.textContent = `${modeText}：${nameInput.value.trim()}（${list.length} 条${countText}）`;
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

document.getElementById("nameBtn").addEventListener("click", () => searchByName(false));
document.getElementById("prefixBtn").addEventListener("click", () => searchByName(true));
document.getElementById("dateBtn").addEventListener("click", () => {
  searchByDate(dateInput.value);
});
document.getElementById("todayBtn").addEventListener("click", () => {
  const today = todayMMDD();
  dateInput.value = today;
  searchByDate(today);
});

nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchByName(event.shiftKey);
  }
});
dateInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchByDate(dateInput.value);
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox || event.target.dataset.lightboxClose != null) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("visible")) {
    closeLightbox();
  }
});

loadCharacters();
