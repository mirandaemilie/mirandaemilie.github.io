/* MOON SEARCH / MOON DATABASE VIEW
 * In this view, users can search up all known moons of Saturn and learn various pieces of information on them
 */

// issues i had: filter, breaks with css, adding my own data to json was time consuming


let moonsData = [];
let renderedCount = 0;
const RENDER_BATCH = 40;

/* ---------------------- Utilities ---------------------- */
function formatDateFRtoUS(dateStr) {
  if (!dateStr || !dateStr.includes("/")) return "Unknown";
  const [dd, mm, yyyy] = dateStr.split("/");
  return `${mm}/${dd}/${yyyy}`;
}

function safeNumber(n, fallback = 0) {
  return typeof n === "number" && !Number.isNaN(n) ? n : fallback;
}

function massValueFull(m) {
  if (!m) return 0;
  return safeNumber(m.massValue) * Math.pow(10, safeNumber(m.massExponent));
}

function volValueFull(v) {
  if (!v) return 0;
  return safeNumber(v.volValue) * Math.pow(10, safeNumber(v.volExponent));
}

// Load JSON 
async function loadJSON() {
  const res = await fetch("moons.json");
  const json = await res.json();

  moonsData = Array.isArray(json.bodies) ? json.bodies.slice() : json.slice();

  moonsData.forEach((m) => {
    if (!m.englishName && m.name) m.englishName = m.name;
  });

  // Default A–Z
  moonsData.sort((a, b) =>
    (a.englishName || "").localeCompare(b.englishName || "")
  );
}

// HTML
export function generateMoonSearchHTML() {
  return `
    <div class="saturn-view moonsearch-view">
      <div class="database-header">
        <h2 class="view-title">Moon Database</h2>
        <p class="view-description">Learn more about the many moons of Saturn.</p>
      </div>

      <div class="stats-container">
        <aside class="stats-sidebar collapsible" id="sidebar">
          
          <div class="sidebar-top">
            <div class="filters-row">
              <input id="moon-search" type="search" placeholder="Search moons..." autocomplete="off" />
              <button id="toggle-filters" class="filter-toggle" aria-expanded="false"></button>
            </div>

            <div id="active-sort-badge"></div>

            <div id="filters-panel" class="filters-panel" hidden>
              <button class="sort-btn" data-sort="az">A → Z</button>
              <button class="sort-btn" data-sort="za">Z → A</button>
              <button class="sort-btn" data-sort="date-old">Discovery Date (Oldest)</button>
              <button class="sort-btn" data-sort="mass">Mass (Small → Large)</button>
              <button class="sort-btn" data-sort="volume">Volume (Small → Large)</button>
              <button class="sort-btn" data-sort="density">Density (Small → Large)</button>
            </div>
          </div>

          <ul id="moon-list" class="moon-list"></ul>
          <div id="list-sentinel"></div>

        </aside>

        <section class="stats-details" id="stats-details">
          <div class="stats-placeholder-msg">
            <span>Select a moon to view details</span>
          </div>
        </section>
      </div>
    </div>
  `;
}

// List of moons
function createListItem(moon) {
  const li = document.createElement("li");
  li.className = "moon-list-item";
  li.tabIndex = 0;

  const label = document.createElement("div");
  label.className = "moon-label";
  label.textContent = moon.englishName || moon.name;

  li.appendChild(label);
  return li;
}

// panel for moon details
function renderDetails(moon, container) {
  container.innerHTML = `
    <div class="stats-header-group"> 
    <div class="stats-image-container"> ${
      moon.image
        ? `<img src="${moon.image}" alt="${moon.englishName}">`
        : `<div class="thumb-fallback large">${(moon.englishName || "")
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
    </div>`
    } 
    </div> 
    <div class="stats-title-group"> 
    <h2>${moon.englishName || moon.name}</h2> 
    <p><strong>Discovery:</strong> ${formatDateFRtoUS(moon.discoveryDate)}</p> 
    <p><strong>Discovered by:</strong> ${moon.discoveredBy || "Unknown"}</p> 
    </div> 
    </div>
    

    <div class="stats-meta">
      <div class="stat-box"><h4>Mass</h4><p>${
        moon.mass
          ? `${moon.mass.massValue} ×10^${moon.mass.massExponent}`
          : "Unknown"
      }</p></div>
      <div class="stat-box"><h4>Volume</h4><p>${
        moon.vol ? `${moon.vol.volValue} ×10^${moon.vol.volExponent}`
          : "Unknown"
      }</p></div>
      <div class="stat-box"><h4>Density</h4><p>${
        moon.density || "Unknown"
      }</p></div>
      <div class="stat-box"><h4>Alternate Name</h4><p>${
        moon.alternativeName || "None"
      }</p></div>
    </div>

    <div class="stats-description">
      <p>${moon.description || "No description available."}</p>
    </div>
  `;
}

// sort and filter
let activeSort = "az";
let currentFilterText = "";

function applySortAndFilter(list) {
  let filtered = list.filter((m) =>
    (m.englishName || "").toLowerCase().includes(currentFilterText)
  );

  switch (activeSort) {
    case "az":
      filtered.sort((a, b) => a.englishName.localeCompare(b.englishName));
      break;
    case "za":
      filtered.sort((a, b) => b.englishName.localeCompare(a.englishName));
      break;
    case "date-old":
      filtered.sort(
        (a, b) => new Date(a.discoveryDate) - new Date(b.discoveryDate)
      );
      break;
    case "mass":
      filtered.sort((a, b) => massValueFull(a.mass) - massValueFull(b.mass));
      break;
    case "volume":
      filtered.sort((a, b) => volValueFull(a.vol) - volValueFull(b.vol));
      break;
    case "density":
      filtered.sort((a, b) => safeNumber(a.density) - safeNumber(b.density));
      break;
  }

  return filtered;
}

// sort badge
function updateSortBadge() {
  const badge = document.getElementById("active-sort-badge");

  const label = {
    az: "A → Z",
    za: "Z → A",
    "date-old": "Discovery Date (Oldest)",
    mass: "Mass (Small → Large)",
    volume: "Volume (Small → Large)",
    density: "Density (Small → Large)"
  }[activeSort];

  badge.innerHTML = `
    <div class="active-filter-display">
      ${label}
      <span class="clear-filter">✕</span>
    </div>
  `;

  badge.querySelector(".clear-filter").onclick = () => {
    activeSort = "az";
    updateSortBadge();
    fullRender();
  };
}

// infinite scroll
function appendNextBatch(sorted, listContainer) {
  const start = renderedCount;
  const end = Math.min(start + RENDER_BATCH, sorted.length);

  for (let i = start; i < end; i++) {
    const moon = sorted[i];
    const li = createListItem(moon);

    li.addEventListener("click", () => {
      listContainer
        .querySelectorAll(".moon-list-item")
        .forEach((x) => x.classList.remove("active"));
      li.classList.add("active");
      renderDetails(moon, document.getElementById("stats-details"));
    });

    listContainer.appendChild(li);
  }

  renderedCount = end;
}

// export inmoonsearchview
export function initMoonSearchView() {
  const search = document.getElementById("moon-search");
  const list = document.getElementById("moon-list");
  const panel = document.getElementById("filters-panel");
  const toggle = document.getElementById("toggle-filters");
  const sentinel = document.getElementById("list-sentinel");

  let dataset = moonsData.slice();

  // render
  window.fullRender = function fullRender() {
    const sorted = applySortAndFilter(dataset);
    list.innerHTML = "";
    renderedCount = 0;
    appendNextBatch(sorted, list);
  };

  // search
  search.addEventListener("input", (e) => {
    currentFilterText = e.target.value.toLowerCase();
    fullRender();
  });

  // toggle dropdown
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
  });

  // sort options
  panel.addEventListener("click", (e) => {
    const btn = e.target.closest(".sort-btn");
    if (!btn) return;

    activeSort = btn.dataset.sort;
    updateSortBadge();
    fullRender();

    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  });

  
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        appendNextBatch(applySortAndFilter(dataset), list);
      }
    },
    { root: list.parentElement, threshold: 0.4 }
  );

  observer.observe(sentinel);


  updateSortBadge();
  fullRender();
}

// export
export async function showMoonSearch() {
  await loadJSON();
  return generateMoonSearchHTML();
}
