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

// Checkerboard Grass Ground
function createGrassTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const divisions = 8;
  const squareSize = size / divisions;
  
  for (let y = 0; y < divisions; y++) {
    for (let x = 0; x < divisions; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#2d5a27' : '#3a7d32'; // Dark and light grass greens
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20); // Repeat across the large plane
  return texture;
}

const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ 
  map: createGrassTexture(), 
  roughness: 0.8,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Create Character
const character = new Character();
scene.add(character.mesh);

// Animation Controller
const animCtrl = new AnimationController(character.mixer, character.clips);

// Movement state
const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 4.5;

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = true;
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = false;
});

// UI Buttons
const btnRun = document.getElementById('runBtn');
const btnPunch = document.getElementById('punchBtn');
const curAction = document.getElementById('currentAction');

let currentActionName = 'idle';
function setAction(name) {
  // Protect 'punch' from being interrupted until it's finished
  if (currentActionName === 'punch' && animCtrl.isActionPlaying('punch')) {
    return; // Ignore new inputs while punching to prevent cutting it off
  }

  if (currentActionName === name) return;
  
  animCtrl.play(name);
  currentActionName = name;
  curAction.textContent = name.charAt(0).toUpperCase() + name.slice(1);
}

// Start with idle
setAction('idle');

btnRun.onclick = () => setAction('run');
btnPunch.onclick = () => setAction('punch');

// Mouse click to punch
window.addEventListener('mousedown', (e) => {
  if (e.button === 0) setAction('punch'); // Left click
});

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Keyboard shortcuts (additional)
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'p') setAction('punch');
});

// Reset action state when a one-shot animation finishes
character.mixer.addEventListener('finished', (e) => {
  currentActionName = 'idle';
  curAction.textContent = 'Idle';
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  
  // Movement logic
  let xInput = 0;
  let zInput = 0;
  if (keys.w) zInput += 1;
  if (keys.s) zInput -= 1;
  if (keys.a) xInput -= 1;
  if (keys.d) xInput += 1;

  if (xInput !== 0 || zInput !== 0) {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up);
    right.y = 0;
    right.normalize();

    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(forward, zInput);
    moveDir.addScaledVector(right, xInput);
    moveDir.normalize();

    character.mesh.position.add(moveDir.multiplyScalar(moveSpeed * delta));
    
    const targetAngle = Math.atan2(moveDir.x, moveDir.z);
    let currentRotation = character.mesh.rotation.y;
    let diff = targetAngle - currentRotation;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    character.mesh.rotation.y += diff * 0.15;
    
    setAction('run');
  } else {
    // Only auto-switch to idle if we were previously running
    if (currentActionName === 'run') {
      setAction('idle');
    }
  }

  character.mixer.update(delta);
  
  // Update camera target to follow character
  controls.target.lerp(new THREE.Vector3(character.mesh.position.x, 1.5, character.mesh.position.z), 0.1);
  controls.update();
  
  renderer.render(scene, camera);
}

animate();
