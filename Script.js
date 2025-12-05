/* script.js — Cyberpunk Time Machine core logic

* Three.js hologram globe background
* Timeline slider -> filters sample events by year
* Clickable glowing markers -> open info panel
* API hooks on window.ChronoRetro
  */

/* ==== DOM refs ==== */
const canvas = document.getElementById('globe-canvas');
const yearSlider = document.getElementById('yearSlider');
const yearDisplay = document.getElementById('yearDisplay');
const monthSelect = document.getElementById('monthSelect');
const timeTravelBtn = document.getElementById('timeTravelBtn');
const infoPanel = document.getElementById('infoPanel');
const infoContent = document.getElementById('infoContent');
const evTitle = document.getElementById('evTitle');
const evMeta = document.getElementById('evMeta');
const evBody = document.getElementById('evBody');
const closeInfo = document.getElementById('closeInfo');

/* ==== Sample historical events dataset ====
Each item: id,title,date(year),lat,lon,era,summary,long
You will replace/extend this with real JSON later.
*/
const EVENTS = [
{ id:'giza', title:'Great Pyramid Completion', year: -2560, month:7, lat:29.9792, lon:31.1342, era:'Ancient', summary:'Khufu's pyramid - monumental architecture of Egypt.', long:'The Great Pyramid of Giza, a feat of engineering, symbolized the pharaonic power and religious devotion of ancient Egypt.'},
{ id:'thermo', title:'Battle of Thermopylae', year:-480, month:8, lat:38.797, lon:22.536, era:'Ancient', summary:'300 Spartans vs Persian forces.', long:'A legendary last stand that shaped Greek identity and resistance.'},
{ id:'const', title:'Fall of Constantinople', year:1453, month:5, lat:41.0082, lon:28.9784, era:'Medieval', summary:'Ottoman conquest ends Byzantine rule.', long:'The capture of Constantinople shifted trade routes and influenced the Age of Exploration.'},
{ id:'mag', title:'Magellan Sets Sail', year:1519, month:9, lat:38.7223, lon:-9.1393, era:'Early Modern', summary:'Beginning of the first circumnavigation.', long:'Ferdinand Magellan's voyage proved the world was round and connected global navigation.'},
{ id:'ind', title:'Industrial Revolution', year:1760, month:1, lat:53.4808, lon:-2.2426, era:'Modern', summary:'Mechanized production spreads across Britain.', long:'A shift from agrarian economies to industrial manufacturing, altering society, work and urban life.'}
];

/* ==== Three.js setup ==== */
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040414);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 6);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.07;
controls.minDistance = 3; controls.maxDistance = 12;

/* lights */
const ambient = new THREE.AmbientLight(0x99c1ff, 0.2);
scene.add(ambient);
const point = new THREE.PointLight(0x88baff, 1.2, 20);
point.position.set(5,5,5);
scene.add(point);

/* composer & bloom for neon glow */
const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));
const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.6, 0.1);
bloom.threshold = 0.15; composer.addPass(bloom);

/* Globe (hologram-like) — use procedural concentric rings + map-like strokes for vibe */
const R = 1.8;
const globeGeo = new THREE.SphereGeometry(R, 64, 64);

// create an equirect-like stylized map procedurally (canvas texture)
function createHoloTexture(size=2048){
const c = document.createElement('canvas'); c.width=c.height=size;
const ctx = c.getContext('2d');
// dark translucent base
ctx.fillStyle = '#071028'; ctx.fillRect(0,0,size,size);
// paint subtle lines for continents (stylized)
ctx.strokeStyle = 'rgba(110,190,255,0.14)'; ctx.lineWidth = 2;
for(let i=0;i<20;i++){
ctx.beginPath();
const y = size*(0.08 + i*0.045);
ctx.moveTo(0,y);
ctx.bezierCurveTo(size*0.2, y-20, size*0.4, y+30, size, y-10);
ctx.stroke();
}
// grid
ctx.strokeStyle = 'rgba(100,140,200,0.06)'; ctx.lineWidth=1;
for(let x=0;x<size;x+=size/24){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,size); ctx.stroke(); }
for(let y=0;y<size;y+=size/12){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(size,y); ctx.stroke(); }
// faint glow spots
for(let i=0;i<150;i++){
ctx.fillStyle = `rgba(120,180,255,${Math.random()*0.04})`;
ctx.beginPath(); ctx.arc(Math.random()*size, Math.random()*size, Math.random()*6,0,Math.PI*2); ctx.fill();
}
return new THREE.CanvasTexture(c);
}

const holoTex = createHoloTexture();
const globeMat = new THREE.MeshStandardMaterial({
map: holoTex,
color: new THREE.Color(0x66aaff),
transparent: true,
opacity: 0.95,
metalness: 0.2,
roughness: 0.9
});
const globe = new THREE.Mesh(globeGeo, globeMat);
globe.rotation.y = Math.PI*0.5;
scene.add(globe);

/* marker group */
const markerGroup = new THREE.Group(); scene.add(markerGroup);

/* helper: lat/lon -> 3D position */
function latLonToVec3(lat, lon, rad=R){
const phi = (90 - lat) * Math.PI/180;
const theta = (lon + 180) * Math.PI/180;
const x = -rad * Math.sin(phi) * Math.cos(theta);
const z = rad * Math.sin(phi) * Math.sin(theta);
const y = rad * Math.cos(phi);
return new THREE.Vector3(x,y,z);
}

/* create marker (glowing sprite) */
function makeMarker(color='#7fd3ff', symbol='•'){
const s=128; const c=document.createElement('canvas'); c.width=c.height=s;
const ctx=c.getContext('2d');
// outer glow
ctx.fillStyle = color; ctx.beginPath(); ctx.arc(s/2,s/2,36,0,Math.PI*2); ctx.fill();
// inner core
ctx.fillStyle = '#001428'; ctx.beginPath(); ctx.arc(s/2,s/2,16,0,Math.PI*2); ctx.fill();
const tex = new THREE.CanvasTexture(c);
return tex;
}

/* show markers filtered by year (±20 years window) */
let currentMarkers = [];
function showMarkersForYear(year){
// cleanup
currentMarkers.forEach(m => { markerGroup.remove(m.sprite); m.sprite.material.map.dispose(); m.sprite.material.dispose(); });
currentMarkers = [];
const windowYears = 15;
const hits = EVENTS.filter(e => Math.abs(e.year - year) <= windowYears);
hits.forEach(ev => {
const tex = makeMarker('#6ef', '•');
const mat = new THREE.SpriteMaterial({ map: tex, transparent:true, opacity:0.95 });
const sprite = new THREE.Sprite(mat);
sprite.scale.set(0.25,0.25,1);
sprite.position.copy(latLonToVec3(ev.lat, ev.lon, R + 0.06));
sprite.userData = { id: ev.id };
markerGroup.add(sprite);
currentMarkers.push({ ev, sprite });
});
}

/* raycast click to open info */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onPointerDown(evt){
const rect = renderer.domElement.getBoundingClientRect();
mouse.x = ((evt.clientX - rect.left)/rect.width)*2 -1;
mouse.y = -((evt.clientY - rect.top)/rect.height)*2 +1;
raycaster.setFromCamera(mouse, camera);
const hits = raycaster.intersectObjects(markerGroup.children, true);
if(hits.length){
const sprite = hits[0].object;
const id = sprite.userData.id;
const ev = EVENTS.find(x=>x.id===id);
if(ev) openInfo(ev);
}
}
window.addEventListener('pointerdown', onPointerDown);

/* open info panel */
function openInfo(ev){
evTitle.textContent = ev.title;
evMeta.textContent = `${formatYear(ev.year)} • ${ev.lat.toFixed(2)}°, ${ev.lon.toFixed(2)}°`;
evBody.innerHTML = `<p>${ev.summary}</p><p style="margin-top:8px">${ev.long}</p>`;
infoPanel.classList.remove('hidden');
}

/* utilities */
function formatYear(y){ return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`; }

/* close info */
closeInfo.addEventListener('click', ()=> infoPanel.classList.add('hidden'));

/* animation loop */
let globeSpin = 0.0016;
function animate(t){
requestAnimationFrame(animate);
globe.rotation.y += globeSpin;
// pulse markers
currentMarkers.forEach((m,i)=>{
const s = 0.22 * (1 + 0.08*Math.sin(performance.now()*0.006 + i));
m.sprite.scale.setScalar(s);
});
controls.update();
composer.render();
}
requestAnimationFrame(animate);

/* resize */
window.addEventListener('resize', ()=>{
camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight);
});

/* ==== UI interactions ==== */
yearDisplay.textContent = yearSlider.value;
showMarkersForYear(parseInt(yearSlider.value,10));

yearSlider.addEventListener('input', (e)=>{
yearDisplay.textContent = e.target.value;
// optionally update interactive markers live
showMarkersForYear(parseInt(e.target.value,10));
});

timeTravelBtn.addEventListener('click', ()=>{
// cinematic spin & particle VFX placeholder
const targetYear = parseInt(yearSlider.value,10);
timeTravelBtn.disabled = true;
timeTravelBtn.textContent = 'WARPING...';
// accelerate spin
const start = globe.rotation.y;
const peak = start + (Math.PI*4 + Math.random()*Math.PI*6);
const dur = 1200;
const t0 = performance.now();
controls.enabled = false;
(function spin(now){
const u = Math.min((now - t0)/dur, 1);
globe.rotation.y = THREE.MathUtils.lerp(start, peak, easeOutCubic(u));
if(u < 1) requestAnimationFrame(spin);
else {
controls.enabled = true;
// settle and update markers for target year
showMarkersForYear(targetYear);
timeTravelBtn.disabled = false;
timeTravelBtn.textContent = 'TIME TRAVEL';
// open overview if exactly one event in window
const hits = EVENTS.filter(e=>Math.abs(e.year - targetYear) <= 15);
if(hits.length === 1) openInfo(hits[0]);
}
})(performance.now());
});

/* easing */
function easeOutCubic(t){ return (--t)*t*t+1 }

/* expose API */
window.ChronoRetro = {
showYear: (y)=> { yearSlider.value = y; yearDisplay.textContent = y; showMarkersForYear(y); },
openEventById: (id)=> { const ev = EVENTS.find(e=>e.id===id); if(ev) openInfo(ev); }
};

/* initial camera/renderer fit */
renderer.setSize(window.innerWidth, window.innerHeight);
composer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.display = 'block';

console.log('ChronoRetro (Cyberpunk) initialized');
