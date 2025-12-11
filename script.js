// help from barry, weird api
// solar system api (https://api.le-systeme-solaire.net/)
// https://api.le-systeme-solaire.net/rest/bodies?satisfy=any
// https://api.le-systeme-solaire.net/rest/bodies?filter[]=aroundPlanet,eq,saturne&exclude=moons,semimajorAxis,perihelion,aphelion,eccentricity,inclination,mainAnomaly,argPeriapsis,longAscNode,flattening
// moons.json came from the solar system api but cors prevented me from using it live
// used postman to download the data as json file
// added photos and descriptions to json myself

// #1: Load Moons.json data

async function loadMoonsData() {
  try {
    const response = await fetch('moons.json');
    const data = await response.json();
    moonsData = data.bodies;  

    console.log("Saturn moon data loaded successfully", data);

    return data;
    
  } catch (error) {
    console.error("Failed to load data:", error);
    throw new Error("Could not load data from API");
  }
}

loadMoonsData(); 

// script.js — Main controller
import { showHoverCards, attachMoonHoverEvents, animateMoons } from "./hovercards.js";
import { showMoonSearch, initMoonSearchView } from "./moonsearch.js";

//   Button highlight state
function updateButtonStates(activeView) {
    document.querySelectorAll(".view-button").forEach(button => {
        button.classList.remove("active");
    });

    const activeButton = document.getElementById(`btn-${activeView}`);
    if (activeButton) activeButton.classList.add("active");
}

// hover cards view
async function openHoverCardsView() {
    const container = document.getElementById("data-display");

    container.innerHTML = `<p class="loading">Loading Saturn system...</p>`;

    const html = await showHoverCards();
    container.innerHTML = html;

    attachMoonHoverEvents();
    animateMoons();
}

//  Moon Search View
async function openMoonSearchView() {
  const container = document.getElementById("data-display");
  container.innerHTML = `<p class="loading">Loading Moons of Saturn...</p>`;

  const html = await showMoonSearch();   
  container.innerHTML = html;

  initMoonSearchView();                  
}


//   Navigation (desktop + mobile)
function setupNavigation() {
    document.getElementById("btn-cards").onclick = () => {
        openHoverCardsView();
        updateButtonStates("cards");
    };

    document.getElementById("btn-search").onclick = () => {
        openMoonSearchView();
        updateButtonStates("search");
    };

    // GSAP button animations
    document.querySelectorAll(".view-button").forEach(btn => {
        btn.addEventListener("mouseenter", () =>
            gsap.to(btn, { scale: 1.07, duration: 0.15 })
        );
        btn.addEventListener("mouseleave", () =>
            gsap.to(btn, { scale: 1, duration: 0.15 })
        );
        btn.addEventListener("mousedown", () =>
            gsap.to(btn, { scale: 0.93, duration: 0.1 })
        );
        btn.addEventListener("mouseup", () =>
            gsap.to(btn, { scale: 1.07, duration: 0.12 })
        );
    });

}


document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();

    // default view
    openHoverCardsView();
    updateButtonStates("cards");
});



// OLD - To test that moons.json worked BEFORE final html css
// async function testMoonsData() {
//   try {
//     const response = await fetch("moons.json");
//     const data = await response.json();
//     const bodies = data.bodies; 

//     console.log("Moons data loaded successfully!");
//     console.log(data);
//     console.log("First moon:", bodies[0]);

//   } catch (err) {
//     console.error("Error loading moons.json:", err);
//   }
// }

// testMoonsData();