/* HOVER CARD VIEW
 * In this view, there are moons and the user can hover over them to see cards about popular Saturn moons
 */

// issues i had: creating the "saturn system" > orbit lines, GSAP, and moons messed up a lot or we were not aligned

// Convert discovery dates from dd/mm/yyyy to mm/dd/yyyy
function formatDateFRtoUS(dateStr) {
  const [day, month, year] = dateStr.split("/");
  return `${month}/${day}/${year}`;
}

// Eight major moons I want
const MAIN_MOONS = [
  "Mimas",
  "Enceladus",
  "Tethys",
  "Dione",
  "Rhea",
  "Titan",
  "Hyperion",
  "Iapetus"
];

let moonsArray = [];

// Load Moons JSON and filter only the main moons
async function loadMoonsJSON() {
  try {
    const response = await fetch("moons.json");
    const data = await response.json();

    moonsArray = data.bodies.filter((m) => MAIN_MOONS.includes(m.englishName));
  } catch (err) {
    console.error("Failed to load moons.json:", err);
    moonsArray = [];
  }
}

// moon angles + radii
function getMoonAngle(index) {
  const angles = [270, 100, 15, 220, 50, 340, 180, 20];
  return angles[index - 1] + "deg";
}

function getMoonRadius(index) {
  // Matches CSS variables
  const radii = [100, 115, 130, 160, 180, 200, 260, 300];
  return radii[index - 1] + "px";
}

/*
   Saturn system HTML
*/
function generateSaturnHTML() {
  const moonHTML = moonsArray
    .map((moon, index) => {
      const num = index + 1;
      return `
                <div class="moon-wrapper moon-${num}"
                     style="--angle:${getMoonAngle(
                       num
                     )}; --radius:${getMoonRadius(num)};">
                    
                    <div class="moon-pos"> <!-- Wrapper handles translation -->
                        <div class="pulse"></div>
                        <div class="pulse"></div>
                        <div class="pulse"></div>
                        <div class="moon" data-moon-name="${
                          moon.englishName
                        }"></div>
                    </div>

                </div>
            `;
    })
    .join("");

  return `
        <div class="saturn-view">
            <div class="hovermoon-header">
                <h2 class="view-title">Main Moons of Saturn</h2>
                <p class="view-description">Interactive View of Eight Spectacular Moons Studied by NASA</p>
            </div>

            <div class="main-saturn-container">
                
                <div class="saturn-system-static">
                    <div class="saturn-center">
                        <div class="rings">
                            <span class="ring ring-1"></span>
                            <span class="ring ring-2"></span>
                            <span class="ring ring-3"></span>
                        </div>
                        <div class="planet"></div>
                    </div>

                    <div class="orbit-lines">
                        ${[...Array(8).keys()]
                          .map(
                            (i) =>
                              `<div class="orbit-line line-${i + 1}"></div>`
                          )
                          .join("")}
                    </div>

                    ${moonHTML}
                </div>

                <div class="moon-info-panel">
                    <p class="placeholder-text">Hover over a moon to see details</p>
                </div>
            </div>
        </div>
    `;
}

/*
The info panel
*/
export function attachMoonHoverEvents() {
  const infoPanel = document.querySelector(".moon-info-panel");
  const container = document.querySelector(".main-saturn-container");

  // close button
  infoPanel.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("close-panel-btn") ||
      e.target.closest(".close-panel-btn")
    ) {
      infoPanel.classList.remove("active");
      container.classList.remove("panel-open");
      document
        .querySelectorAll(".moon")
        .forEach((m) => m.classList.remove("active-moon"));
    }
  });

  // closing modal
  container.addEventListener("click", (e) => {
    // If backdrop is visible AND click is NOT on the panel/saturn
    if (
      container.classList.contains("panel-open") &&
      !e.target.closest(".moon-info-panel") &&
      !e.target.closest(".saturn-system-static")
    ) {
      infoPanel.classList.remove("active");
      container.classList.remove("panel-open");
      document
        .querySelectorAll(".moon")
        .forEach((m) => m.classList.remove("active-moon"));
    }
  });

  // Moon Interactions
  document.querySelectorAll(".moon").forEach((moon) => {
    const moonName = moon.dataset.moonName;
    const moonData = moonsArray.find((m) => m.englishName === moonName);

    const updatePanel = () => {
      // Remove active class from other moons
      document
        .querySelectorAll(".moon")
        .forEach((m) => m.classList.remove("active-moon"));
      moon.classList.add("active-moon");

      infoPanel.classList.add("active");
      container.classList.add("panel-open");

      infoPanel.innerHTML = `
                    <button class="close-panel-btn" aria-label="Close details">×</button>
                    <img src="${moonData.image}" alt="${moonData.englishName}">
                    <h3>${moonData.englishName}</h3>

                    <div class="moon-content">
                        <p><strong>Discovered by:</strong> ${
                          moonData.discoveredBy
                        }</p>
                        <p><strong>Discovery Date:</strong> ${formatDateFRtoUS(
                          moonData.discoveryDate
                        )}</p>
                        <p>${moonData.description}</p>
                    </div>
                `;
    };

    // DESKTOP: Hover
    moon.addEventListener("mouseenter", updatePanel);

    // MOBILE: Click
    moon.addEventListener("click", (e) => {
      e.stopPropagation();
      updatePanel();
    });

    // DESKTOP: Mouseleave (Only clear if screen is wide)
    moon.addEventListener("mouseleave", () => {
      if (window.innerWidth > 900) {
        infoPanel.classList.remove("active");
        moon.classList.remove("active-moon");
        infoPanel.innerHTML = `
                        <p class="placeholder-text">Hover or tap a moon to see details</p>
                    `;
      }
    });
  });
}

//   GSAP animation – pulses + hover scaling
export function animateMoons() {
  document.querySelectorAll(".moon-wrapper").forEach((wrapper) => {
    const moon = wrapper.querySelector(".moon");
    const pulses = wrapper.querySelectorAll(".pulse");

    // Continuous pulses
    pulses.forEach((pulse, i) => {
      gsap.fromTo(
        pulse,
        { scale: 0, opacity: 0.5, xPercent: -50, yPercent: -50 },
        {
          scale: 2.3,
          opacity: 0,
          duration: 1.6,
          repeat: -1,
          ease: "sine.out",
          delay: i * 0.25,
          xPercent: -50,
          yPercent: -50
        }
      );
    });

    // Hover effects
    moon.addEventListener("mouseenter", () => {
      gsap.to(moon, {
        scale: 1.5,
        duration: 0.3,
        backgroundColor: "var(--secondary-color)",
        xPercent: -50,
        yPercent: -50
      });
      pulses.forEach((p) => gsap.to(p, { opacity: 0, duration: 0.15 }));
    });

    moon.addEventListener("mouseleave", () => {
      gsap.to(moon, {
        scale: 1,
        duration: 0.3,
        backgroundColor: "var(--primary-color)",
        xPercent: -50,
        yPercent: -50
      });
      pulses.forEach((p) => gsap.to(p, { opacity: 0.5, duration: 0.15 }));
    });

    gsap.set(moon, { xPercent: -50, yPercent: -50 });
  });
}

//   Main export – loads data + returns HTML
export async function showHoverCards() {
  await loadMoonsJSON();
  return generateSaturnHTML();
}