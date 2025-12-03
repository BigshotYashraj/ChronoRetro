// --- THREE.JS GLOBE SETUP ---
const canvas = document.getElementById("globe-canvas");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3.2);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xfff0b5, 1.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffd27f, 2);
pointLight.position.set(5, 3, 5);
scene.add(pointLight);

// --- GLOBE TEXTURE ---
const textureLoader = new THREE.TextureLoader();
const globeTexture = textureLoader.load("assets/globe_texture.png");

// --- GLOBE GEOMETRY ---
const globeGeometry = new THREE.SphereGeometry(1.3, 64, 64);
const globeMaterial = new THREE.MeshStandardMaterial({
map: globeTexture,
roughness: 0.8,
metalness: 0.1
});
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);

// --- ANIMATION LOOP ---
function animate() {
requestAnimationFrame(animate);

// rotate globe slowly
globe.rotation.y += 0.002;

renderer.render(scene, camera);
}
animate();

// --- HANDLE WINDOW RESIZE ---
window.addEventListener("resize", () => {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- TIMELINE SLIDER ---
const yearSlider = document.getElementById("year-slider");
const yearValue = document.getElementById("year-value");

yearSlider.oninput = () => {
yearValue.textContent = yearSlider.value;
};
