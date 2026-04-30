// main.js – sets up Three.js scene, loads character and animation controller

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Character } from './character.js';
import { AnimationController } from './animationController.js';

// Scene & Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(5, 5, 10);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2, 0);

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// Ground Plane
const grid = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
scene.add(grid);

// Create Character
const character = new Character();
scene.add(character.mesh);

// Animation Controller
const animCtrl = new AnimationController(character.mixer, character.clips);

// UI Buttons
const btnRun = document.getElementById('runBtn');
const btnJump = document.getElementById('jumpBtn');
const btnKick = document.getElementById('kickBtn');
const btnPunch = document.getElementById('punchBtn');
const curAction = document.getElementById('currentAction');

function setAction(name) {
  animCtrl.play(name);
  curAction.textContent = name.charAt(0).toUpperCase() + name.slice(1);
}

btnRun.onclick = () => setAction('run');
btnJump.onclick = () => setAction('jump');
btnKick.onclick = () => setAction('kick');
btnPunch.onclick = () => setAction('punch');

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case 'r': setAction('run'); break;
    case 'j': setAction('jump'); break;
    case 'k': setAction('kick'); break;
    case 'p': setAction('punch'); break;
  }
});

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  character.mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}

animate();
