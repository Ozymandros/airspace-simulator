# 3D Airspace Simulator

A browser-based 3D airspace simulation where twenty autonomous classical biplanes fly inside a bounded volume over procedural terrain. Built as a single self-contained HTML file using [Three.js](https://threejs.org/) for rendering and [Yuka](https://mugen87.github.io/yuka/) for steering and flocking behavior.

![3D Airspace Simulator](https://img.shields.io/badge/runtime-browser-blue) ![Three.js](https://img.shields.io/badge/Three.js-0.160.0-black) ![Yuka](https://img.shields.io/badge/Yuka-0.7.8-green)

## Features

- **Autonomous fleet** — 20 color-coded biplanes with smoothed turns and continuous motion
- **Classical aircraft models** — biplane wings, struts, tail-dragger gear, and speed-linked propellers
- **Variable cruise speeds** — each aircraft has its own max speed (8–18), minimum airspeed, and acceleration
- **Flocking AI** — separation, alignment, and cohesion steering keep the fleet moving naturally as a group
- **Bounded airspace** — soft containment steering plus hard boundary clamping keeps all aircraft inside a 200×200×200 unit cube
- **Altitude wander** — each aircraft periodically picks a new cruise altitude for natural vertical movement
- **Procedural landscape** — flat valley under the airspace with rising mountains, scattered trees, houses, and drifting clouds
- **Flight trails** — colored path history behind each aircraft
- **Camera modes** — free orbit/pan/zoom, or follow any aircraft with adjustable chase distance
- **Live telemetry** — speed readout while tracking an aircraft
- **Pause and time scale** — freeze the simulation or run at 1×, 2×, or 4× speed
- **Zero build step** — no npm install, bundler, or compile step required

## Quick Start

The simulator loads ES modules from a CDN, so it must be served over HTTP (opening the file directly with `file://` may fail in some browsers).

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/airspace-simulator.git
   cd airspace-simulator
   ```

2. Start a local static server from the project directory. Any of these work:

   ```bash
   # Python
   python -m http.server 8080

   # Node (npx, no install required)
   npx serve .

   # PHP
   php -S localhost:8080
   ```

3. Open `http://localhost:8080/airspace-simulator.html` in a modern browser (Chrome, Firefox, Edge, or Safari).

## Controls

| Input | Action |
| --- | --- |
| **Left drag** | Orbit the camera (free mode) |
| **Right drag** | Pan the camera |
| **Mouse wheel** | Zoom in/out (free mode) or adjust follow distance (tracking mode) |
| **Click aircraft** | Follow that aircraft |
| **Click empty space** | Release follow mode |
| **ESC** | Release follow mode |
| **Space** | Pause / resume simulation |
| **1 / 2 / 4** | Set time scale to 1×, 2×, or 4× |
| **Fleet dots** (top-left panel) | Select an aircraft to follow |

While paused, aircraft and clouds freeze but you can still orbit the camera in free mode. The status line in the top-left panel shows `Running · 1×` or `Paused · 2×`, etc.

## How It Works

### Rendering (Three.js)

- Perspective camera with damped orbit controls
- Procedural terrain mesh with vertex-colored grass, rock, and snow
- Instanced trees and houses scattered outside the airspace footprint
- Low-poly classical biplane models — fuselage, dual wings, struts, empennage, landing gear, and spinning propellers
- Emissive highlighting on the tracked aircraft
- Line-based flight trails and soft fog for depth

### Steering (Yuka)

Each aircraft is a Yuka `Vehicle` with combined steering behaviors:

| Behavior | Purpose |
| --- | --- |
| **Wander** | Exploratory horizontal movement |
| **Separation** | Avoid crowding nearby aircraft |
| **Alignment** | Match heading with neighbors (light weight to preserve speed variation) |
| **Cohesion** | Stay loosely grouped with the flock |
| **Containment** | Smooth inward push near airspace walls |
| **Altitude wander** | Gradual vertical cruise-altitude changes |

Each plane gets a random cruise speed and a per-aircraft minimum airspeed floor. A `Smoother` on orientation produces banking-style turns instead of instant snaps. Propeller rotation is tied to live airspeed.

### Airspace

The operational volume is a **200-unit cube** centered at the origin. Terrain directly beneath stays flat so mountains never intrude into the box. Clouds drift horizontally above the scene.

## Project Structure

```
airspace-simulator/
├── airspace-simulator.html   # Complete app (HTML, CSS, and JavaScript)
└── README.md
```

All application code lives in `airspace-simulator.html`. Dependencies are loaded at runtime via an import map:

- `three@0.160.0` — WebGL rendering
- `three/addons/` — OrbitControls
- `yuka@0.7.8` — entity/steering framework

## Requirements

- A modern browser with WebGL and ES module support
- Network access on first load (CDN dependencies)
- A local HTTP server to run the file

## Browser Compatibility

Tested behavior targets current versions of Chromium, Firefox, and WebKit-based browsers. WebGL must be enabled.

## License

No license file is included yet. Add one if you plan to open-source or share this project publicly.
