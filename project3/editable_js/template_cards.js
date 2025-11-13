
/**
 * CARD VIEW - PROVIDED AS EXAMPLE
 * Display data as browsable cards - good for comparing individual items
 */
import loadData from "./load_data.js";

const upperCaseExceptions = ["BBQ", "TGI", "B&A", "TEX-MEX", "I", "II", "III", "IV", "LLC", "D-LITE", "UMCP", "MD", "MGM", "KFC"];

function toTitleCase(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map(word => upperCaseExceptions.includes(word.toUpperCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function dateFormat(dateString) {
  if (!dateString || dateString === '------') return 'Unknown date';
  const date = new Date(dateString);
  return isNaN(date) ? 'Unknown date' : date.toLocaleDateString();
}

function getBgColor(result) {
  if (!result) return "#F0F0F0";
  switch (result) {
    case "Critical Violations observed":
    case "Non-Compliant - Violations Observed":
    case "Facility Closed":
      return "#F4B8BC";
    case "Facility Reopened":
    case "Compliance Schedule - Completed":
    case "Compliance Schedule - Outstanding":
      return "#FFEDAE";
    case "Compliant - No Health Risk":
    case "Compliant":
      return "#C4F4C7";
    default:
      return "#F0F0F0";
  }
}

function showCards(data) {
  if (!Array.isArray(data)) return `<p class="error">No data available.</p>`;

  const maxCards = 12;
  const randomRestaurants = [...data].sort(() => Math.random() - 0.5).slice(0, maxCards);

  const cardHTML = randomRestaurants.map(r => {
    const address = `${toTitleCase(r.address_line_1)}, ${toTitleCase(r.city)}, ${r.state}, ${r.zip}`;
    const bgColor = getBgColor(r.inspection_results);

    return `
      <div class="restaurant-card" style="background-color: ${bgColor};">
        <h2>${toTitleCase(r.name)} <i class="fa-solid fa-utensils" style="color: #000000;"></i></h2>
        <p><i class="fa-solid fa-location-dot" style="color: #000000;"></i> <strong>${address}</strong></p>
        <p><i class="fa-solid fa-box" style="color: #000000;"></i> <strong>Inspection Results:</strong> ${r.inspection_results || "Unknown"}</p>
        <p><i class="fa-solid fa-calendar-days" style="color: #000000;"></i> <strong>Date of Last Inspection:</strong> ${dateFormat(r.inspection_date)}</p>
        <p><i class="fa-solid fa-building" style="color: #000000;"></i> <strong>Type:</strong> ${r.category}</p>
        <p><i class="fa-solid fa-user" style="color: #000000;"></i> <strong>Owner:</strong> ${toTitleCase(r.owner)}</p>
      </div>
    `;
  }).join("");

  return `
    <h2 class="view-title">PG County Restaurant Randomizer <i class="fa-solid fa-shuffle"></i></h2>
    <p class="view-description">Examine compliance records for various restaurants across Prince George's County, Maryland.</p>
    <div class="card-grid">${cardHTML}</div>
  `;
}

async function showCardsView() {
  try {
    const data = await loadData();
    document.querySelector(".display-container").innerHTML = showCards(data);
    setActiveView("cards");
  } catch (error) {
    console.error(error);
    document.querySelector(".display-container").innerHTML = `<p class="error">Failed to load restaurant data.</p>`;
  }
}

function setActiveView(viewName) {
  document.querySelectorAll(".view-button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });
}

export default showCardsView;