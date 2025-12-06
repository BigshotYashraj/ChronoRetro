/* --------------------------
   BASIC TIME MACHINE ENGINE
---------------------------*/

// 1) Create the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("globe-canvas")
});
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 3;

// 2) Load Earth texture
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("globe_texture.png");

// 3) Create Earth sphere
const earthGeo = new THREE.SphereGeometry(1, 32, 32);
const earthMat = new THREE.MeshBasicMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeo, earthMat);
scene.add(earth);

// 4) Normal slow rotation
let spinSpeed = 0.002;

// 5) Time travel animation state
let isTimeTraveling = false;
let travelSpinTime = 0;

// 6) Timeline events
const timelineEvents = {
  "-3000": ["Development of ancient writing systems begins"],
  "44": ["Assassination of Julius Caesar"],
  "476": ["Fall of the Western Roman Empire"],
  "1492": ["Columbus reaches the Americas"],
  "1776": ["American Declaration of Independence"],
  "1914": ["Start of World War 1"],
  "1939": ["Start of World War 2"],
  "1969": ["Moon Landing"],
  "1991": ["Internet becomes public"],
  "2007": ["First iPhone released"],
};

// 7) Update year display live
const slider = document.getElementById("yearSlider");
const yearDisplay = document.getElementById("yearDisplay");

slider.oninput = () => {
  yearDisplay.innerText = slider.value;
};

// 8) Show events after time travel
function showEvents(year) {
  const viewer = document.getElementById("event-viewer");

  if (timelineEvents[year]) {
    viewer.innerHTML = `
      <h2>${year}</h2>
      <ul>
        ${timelineEvents[year].map(ev => `<li>${ev}</li>`).join("")}
      </ul>
    `;
  } else {
    viewer.innerHTML = `
      <h2>${year}</h2>
      <p>No major events found.</p>
    `;
  }
}

// 9) Time travel button
document.getElementById("timeTravelBtn").onclick = () => {
  const year = slider.value;

  // start fast spinning
  spinSpeed = 0.3;
  isTimeTraveling = true;
  travelSpinTime = 0;

  // reveal event after animation
  setTimeout(() => showEvents(year), 1200);
};

// 10) Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (isTimeTraveling) {
    travelSpinTime += 0.016;

    if (travelSpinTime >= 1) {
      // stop fast spin
      spinSpeed = 0.002;
      isTimeTraveling = false;
    }
  }

  earth.rotation.y += spinSpeed;
  renderer.render(scene, camera);
}

animate();
