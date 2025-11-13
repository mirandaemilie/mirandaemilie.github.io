/**
 * MAP VIEW - FOR PROJECT 3
 * Map of all restaurants in PG County with filtering by compliance
 */

import loadData from "./load_data.js";

let myMap = null;
let restaurants = [];
let mapMarkers = [];

// Shares the compliance results
function getComplianceCategory(result) {
  if (!result || result === "------") return "unknown";
  if (result === "Compliant - No Health Risk") return "compliant";
  if (["Non-Compliant - Violations Observed", "Critical Violations observed", "Facility Closed"].includes(result)) return "nonCompliant";
  if (["Compliance Schedule - Completed", "Compliance Schedule - Outstanding", "Facility Reopened"].includes(result)) return "schedule";
  return "unknown";
}

// Colors for markers later to visually show compliance results
function getComplianceColor(category) {
  switch (category) {
    case "compliant": return "#4CAF50";       // green
    case "nonCompliant": return "#F44336";    // red
    case "schedule": return "#FFC107";        // yellow
    default: return "#9E9E9E";                // gray
  }
}

async function showMapView() {
  try {
    if (restaurants.length === 0) {
      restaurants = await loadData();
    }

// Adds checkboxes for filtering, search box, map
      document.querySelector(".display-container").innerHTML = `
      <h2 class="view-title">PG County Restaurants Map <i class="fa-solid fa-map-location-dot"></i></h2>
      <p class="view-description">Explore restaurant compliance, search for places, or find ones near you.</p>

      <div class="map-filters" style="margin-bottom: 1rem;">
        <label><input type="checkbox" value="compliant" checked> Compliant</label>
        <label><input type="checkbox" value="nonCompliant" checked> Non-Compliant</label>
        <label><input type="checkbox" value="schedule" checked> Ongoing Inspection</label>
        <label><input type="checkbox" value="unknown" checked> Unknown</label>
      </div>

      <div class="map-controls" style="margin-bottom: 1rem;">
        <input type="text" id="location-search" placeholder="Enter address or ZIP code..." />
        <button id="search-btn"><i class="fa-solid fa-magnifying-glass"></i> Search</button>
        <button id="near-me-btn"><i class="fa-solid fa-location-crosshairs"></i> Near Me</button>
      </div>

      <div id="restaurant-map" style="width: 100%; height: 600px; border-radius: 8px;"></div>

      <div id="map-info" class="map-info" style="margin-top: 1rem; background: white; padding: 1rem; border-radius: 8px; display: none;"></div>
    `;

// Search button
async function handleSearch() {
  const query = document.getElementById("location-search").value.trim();
  if (!query) return alert("Please enter a location.");

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const results = await response.json();

    if (results.length > 0) {
      const { lat, lon, display_name } = results[0];
      myMap.setView([lat, lon], 13);

      // marker for the searched location
      L.marker([lat, lon])
        .addTo(myMap)
        .bindPopup(`<strong>${display_name}</strong>`)
        .openPopup();
    } else {
      alert("Location not found.");
    }
  } catch (err) {
    console.error(err);
    alert("Error searching for location.");
  }
}

// Search button click
document.getElementById("search-btn").addEventListener("click", handleSearch);

// Pressing Enter triggers search
document.getElementById("location-search").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSearch();
  }
});



    // Restaurants Near Me
    document.getElementById("near-me-btn").addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const { latitude, longitude } = pos.coords;
          myMap.setView([latitude, longitude], 13);
          L.marker([latitude, longitude]).addTo(myMap)
            .bindPopup("You are here").openPopup();
        }, () => alert("Unable to get your location."));
      } else {
        alert("Geolocation not supported by your browser.");
      }
    });

    // Adding the Leaflet map
    if (myMap) {
      myMap.remove();
      myMap = null;
    }

    myMap = L.map("restaurant-map").setView([38.9897, -76.9378], 12);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors'
    }).addTo(myMap);

    // Adding the markers and their visuals
    mapMarkers = [];
    restaurants.forEach(r => {
      const lat = r.geocoded_column_1?.coordinates?.[1];
      const lng = r.geocoded_column_1?.coordinates?.[0];
      if (!lat || !lng) return;

      const category = getComplianceCategory(r.inspection_results);

      const iconHtml = `<i class="fa-solid fa-location-dot" style="color:${getComplianceColor(category)}; font-size: 1.5rem;"></i>`;

      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: iconHtml,
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        })
      });

      marker.bindPopup(`
        <strong>${r.name}</strong><br>
        Type: ${r.category || "Unknown"}<br>
        Compliance: ${r.inspection_results || "Unknown"}
      `);

      marker.addTo(myMap);
      mapMarkers.push({ marker, category });
    });

    // filters working with checkboxes 
    document.querySelectorAll(".map-filters input[type=checkbox]").forEach(input => {
      input.addEventListener("change", () => {
        const checkedCategories = Array.from(document.querySelectorAll(".map-filters input[type=checkbox]:checked")).map(cb => cb.value);
        mapMarkers.forEach(({ marker, category }) => {
          if (checkedCategories.includes(category)) {
            marker.addTo(myMap);
          } else {
            marker.remove();
          }
        });
      });
    });

    // The view button
    document.querySelectorAll(".view-button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === "map");
    });

  } catch (error) {
    console.error(error);
    document.querySelector(".display-container").innerHTML =
      `<p class="error">Failed to load map. Try again. ${error.message}</p>`;
  }
}

export default showMapView;
