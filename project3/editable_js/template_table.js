/**
 * TABLE VIEW - PROVIDED AS EXAMPLE
 * Scrollable and sortable table with sorting arrows
 */
import loadData from "./load_data.js";

const upperCaseExceptions = ["BBQ", "TGI", "B&A", "TEX-MEX", "I", "II", "III", "IV", "LLC", "D-LITE", "UMCP"];

function toTitleCase(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map(word => {
      if (upperCaseExceptions.includes(word.toUpperCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function getBgColor(result) {
  if (!result) return "#F0F0F0";
  switch (result) {
    case "Critical Violations observed":
    case "Non-Compliant - Violations Observed":
    case "Facility Closed":
      return "#F4B8BC"; // red
    case "Facility Reopened":
    case "Compliance Schedule - Completed":
    case "Compliance Schedule - Outstanding":
      return "#FFEDAE"; // yellow
    case "Compliant - No Health Risk":
      return "#C4F4C7"; // green
    default:
      return "#F0F0F0"; // gray
  }
}

let sortDirections = {};

function sortTableData(data, key) {
  const direction = sortDirections[key] === "asc" ? "desc" : "asc";
  sortDirections[key] = direction;

  return [...data].sort((a, b) => {
    let valA = a[key] || "";
    let valB = b[key] || "";

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

function setActiveView(viewName) {
  document.querySelectorAll(".view-button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });
}

function renderTable(data) {
  const tableRows = data.map(r => {
    const name = toTitleCase(r.name);
    const city = toTitleCase(r.city);
    const result = r.inspection_results;
    const handWashing = r.proper_hand_washing;
    const illWorkers = r.ill_workers_restricted;
    const sewage = r.proper_sewage_disposal;
    const rodentsInsects = r.rodent_and_insects;
    const category = r.category; 
    const bgColor = getBgColor(result);

    return `
      <tr style="background-color: ${bgColor}">
        <td>${name}</td>
        <td>${city}</td>
        <td>${category}</td>
        <td>${result}</td>
        <td>${handWashing}</td>
        <td>${illWorkers}</td>
        <td>${sewage}</td>
        <td>${rodentsInsects}</td>
      </tr>
    `;
  }).join("");

function getArrow(key) {
  if (!sortDirections[key]) return `<i class="fa-solid fa-caret-down" style="color:#888;"></i>`; // neutral/down caret
  return sortDirections[key] === "asc"
    ? `<i class="fa-solid fa-caret-up" style="color:#000;"></i>`   // ascending
    : `<i class="fa-solid fa-caret-down" style="color:#000;"></i>`; // descending
}


  return `
    <h2 class="view-title">PG County Restaurants <i class="fa-solid fa-utensils" style="color: #000000;"></i></h2>
    <p class="view-description">See the PG County restaurants feeding you delicious food that's also safe.</p>
    <div class="table-wrapper">
      <table class="restaurant-table">
        <thead>
          <tr>
            <th data-key="name">Restaurant ${getArrow("name")}</th>
            <th data-key="city">City ${getArrow("city")}</th>
            <th data-key="category">Type ${getArrow("category")}</th>
            <th data-key="inspection_results">Overall Inspection Results ${getArrow("inspection_results")}</th>
            <th data-key="proper_hand_washing">Hand Washing ${getArrow("proper_hand_washing")}</th>
            <th data-key="ill_workers_restricted">Ill Workers ${getArrow("ill_workers_restricted")}</th>
            <th data-key="proper_sewage_disposal">Sewage Disposal ${getArrow("proper_sewage_disposal")}</th>
            <th data-key="rodent_and_insects">Rodents and Insects ${getArrow("rodent_and_insects")}</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}

function enableTableSorting(data) {
  document.querySelectorAll(".restaurant-table th").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      const sortedData = sortTableData(data, key);
      document.querySelector(".display-container").innerHTML = renderTable(sortedData);
      enableTableSorting(sortedData); // Reattach listeners
    });
  });
}

async function showTableView() {
  try {
    const data = await loadData();
    document.querySelector(".display-container").innerHTML = renderTable(data);
    enableTableSorting(data);
    setActiveView("table");
  } catch (error) {
    console.error(error);
    document.querySelector(".display-container").innerHTML =
      `<p class="error">Failed to load restaurant data.</p>`;
  }
}

// Initialize table view
showTableView();

export default showTableView;
