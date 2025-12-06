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

// 2) Create the Earth sphere
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("earth.jpg"); // make sure file is in your repo

const earthGeo = new THREE.SphereGeometry(1, 32, 32);
const earthMat = new THREE.MeshBasicMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeo, earthMat);
scene.add(earth);

// 3) Normal slow rotation
let spinSpeed = 0.002;

// 4) Time travel animation state
let isTimeTraveling = false;
let travelSpinTime = 0;

// 5) Data: events by year
const timelineEvents = {
44: ["Assassination of Julius Caesar"],
476: ["Fall of the Western Roman Empire"],
1492: ["Columbus reaches the Americas"],
1776: ["American Declaration of Independence"],
1914: ["Start of World War 1"],
1939: ["Start of World War 2"],
1969: ["Moon Landing"],
1991: ["Internet becomes public"],
2007: ["First iPhone released"],
};

// 6) Render events in viewer
function showEvents(year) {
const viewer = document.getElementById("event-viewer");

if (timelineEvents[year]) {
viewer.innerHTML = `      <h2>${year}</h2>       <ul>
        ${timelineEvents[year].map(ev =>`<li>${ev}</li>`).join("")}       </ul>
    `;
} else {
viewer.innerHTML = `       <h2>${year}</h2>       <p>No major events found.</p>
    `;
}
}

// 7) Time travel button click
document.getElementById("timeTravelBtn").onclick = () => {
const year = parseInt(document.getElementById("yearSlider").value);

// start spinning FAST
spinSpeed = 0.3;
isTimeTraveling = true;
travelSpinTime = 0;

// delay event reveal until spinning finishes
setTimeout(() => showEvents(year), 1000);
};

// 8) Main animation loop
function animate() {
requestAnimationFrame(animate);

if (isTimeTraveling) {
travelSpinTime += 0.016;
if (travelSpinTime >= 1) {
// stop time travel spin
spinSpeed = 0.002;
isTimeTraveling = false;
}
}

earth.rotation.y += spinSpeed;

renderer.render(scene, camera);
}

animate();
