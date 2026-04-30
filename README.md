# 3D Male Player Demo

## Overview
A lightweight **Three.js** demo that showcases a low‑poly male character with four actions:
- **Run** – looping, legs and arms swing
- **Jump** – upward hop with knee bend
- **Kick** – right‑leg kick with torso twist
- **Punch** – right‑arm punch with slight torso lean

The UI features a glass‑morphic control panel with buttons and keyboard shortcuts (`R`, `J`, `K`, `P`).

## Files
| File | Purpose |
|------|---------|
| `index.html` | Boilerplate page, loads Three.js from CDN and our module scripts |
| `style.css` | Dark, premium styling with gradient buttons and glass panel |
| `main.js` | Scene setup, lights, ground grid, character instantiation, UI wiring |
| `character.js` | Builds a simple skinned mesh (boxes) and defines the animation clips |
| `animationController.js` | Simple wrapper around `THREE.AnimationMixer` for easy play / cross‑fade |
| `README.md` (this file) | Instructions for running the demo |

## Running the Demo
Because the scripts are ES modules, they must be served over **HTTP** (browsers block `file://` module imports).

### Quick start (Windows PowerShell)
```powershell
# Install a tiny static server (only once)
npm i -g http-server
# From the project folder
cd C:\Users\cmwei\dev\workspace\nameitlater
# Serve on default port 8080
http-server .
```
Open your browser and navigate to `http://127.0.0.1:8080`. You should see the character on a grid. Use the UI buttons or press **R/J/K/P** to trigger the animations.

### Alternative (Vite) – if you prefer a full dev server
```powershell
npx -y create-vite@latest ./ --template vanilla
# Copy the generated `index.html`, `style.css`, `main.js` etc. over the Vite `src` folder.
# Then run
npm install
npm run dev
```
(You don't need to do this unless you want hot‑module reload.)

## Controls
- **Orbit** – click‑drag mouse to rotate camera, scroll to zoom
- **Run** – `R` or click **Run** button (loops)
- **Jump** – `J`
- **Kick** – `K`
- **Punch** – `P`

## Customization
- Replace the low‑poly skeleton with a GLTF model (e.g., from Mixamo) by loading it in `character.js` and mapping its bones to the same names used in the clips.
- Adjust clip keyframes for more realistic motion or change the accent colors in `style.css`.

Enjoy the animation!
