/**
 * CATEGORY VIEW - STUDENTS IMPLEMENT
 * Group data by categories - good for understanding relationships and patterns
 */

import loadData from "./load_data.js";

const upperCaseExceptions = [
  "BBQ", "TGI", "B&A", "TEX-MEX", "I", "II", "III", "IV",
  "LLC", "D-LITE", "UMCP"
];

// title case
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


function getComplianceGroup(result) {
  if (!result) return "unknown";
  if (result === "Compliant - No Health Risk" || result === "Compliance Schedule - Completed") return "compliant";
  if (["Non-Compliant - Violations Observed", "Critical Violations observed", "Facility Closed"].includes(result)) return "nonCompliant";
  if (["Compliance Schedule - Outstanding", "Facility Reopened"].includes(result)) return "schedule";
  return "unknown";
}


async function showCategoryView() {
  try {
    const data = await loadData();
    
    // Group
    const complianceGroups = {
      compliant: {},
      nonCompliant: {},
      schedule: {},
      unknown: {}
    };

    data.forEach(r => {
      const city = toTitleCase(r.city || "Unknown City");
      const name = toTitleCase(r.name);
      const group = getComplianceGroup(r.inspection_results);

      if (!complianceGroups[group][city]) complianceGroups[group][city] = [];
      complianceGroups[group][city].push(name);
    });

    // Labels
    const groupLabels = {
      compliant: "Compliant",
      nonCompliant: "Non-Compliant",
      schedule: "Compliance Schedule",
      unknown: "Unknown"
    };


    let categoryHTML = "";
    for (const group in complianceGroups) {
      const cities = complianceGroups[group];
      categoryHTML += `
        <div class="category-section">
          <h3 class="category-header ${group}" data-group="${group}">
            <i class="fa fa-caret-right"></i> ${groupLabels[group]}
          </h3>
          <div class="category-items" style="display:none;">
      `;
      for (const city in cities) {
        categoryHTML += `
          <h4 class="category-subheader" data-city="${city}">
            <i class="fa fa-caret-right"></i> ${city} (${cities[city].length})
          </h4>
          <ul class="category-items" id="city-${group}-${city.replace(/\s+/g, '-')}" style="display:none;">
            ${cities[city].map(name => `<li class="category-item">${name}</li>`).join("")}
          </ul>
        `;
      }
      categoryHTML += `</div></div>`;
    }

    document.querySelector(".display-container").innerHTML = `
      <h2 class="view-title">Restaurants by Compliance & City <i class="fa-solid fa-city" style="color: #000;"></i></h2>
      ${categoryHTML}
    `;

    setActiveView("categories");
    enableCategoryToggles();
    
  } catch (error) {
    console.error(error);
    document.querySelector(".display-container").innerHTML =
      `<p class="error">Failed to load restaurant data.</p>`;
  }
}

// expand/collapse
function enableCategoryToggles() {
  document.querySelectorAll(".category-header").forEach(header => {
    header.addEventListener("click", () => {
      const list = header.nextElementSibling;
      const icon = header.querySelector("i");
      if (list.style.display === "none") {
        list.style.display = "block";
        icon.classList.replace("fa-caret-right", "fa-caret-down");
      } else {
        list.style.display = "none";
        icon.classList.replace("fa-caret-down", "fa-caret-right");
      }
    });
  });

  document.querySelectorAll(".category-subheader").forEach(sub => {
    sub.addEventListener("click", () => {
      const list = document.getElementById(
        `city-${sub.closest(".category-section").querySelector(".category-header").dataset.group}-${sub.dataset.city.replace(/\s+/g, '-')}`
      );
      const icon = sub.querySelector("i");
      if (list.style.display === "none") {
        list.style.display = "block";
        icon.classList.replace("fa-caret-right", "fa-caret-down");
      } else {
        list.style.display = "none";
        icon.classList.replace("fa-caret-down", "fa-caret-right");
      }
    });
  });
}

function setActiveView(viewName) {
  document.querySelectorAll(".view-button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });
}

export default showCategoryView;
