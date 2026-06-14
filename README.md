# 3D Airspace Simulator

A browser-based 3D airspace simulation where twenty autonomous classical biplanes fly inside a bounded volume over procedural terrain. Built with [Three.js](https://threejs.org/) for rendering and [Yuka](https://mugen87.github.io/yuka/) for steering and flocking behavior.

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

## Quick Start

### Windows

Double-click `serve.bat` — it installs dependencies on first run and starts the dev server.

### Any platform

Requires [pnpm](https://pnpm.io/) 9+ (Node.js 18+ ships with Corepack: `corepack enable`).

```bash
git clone https://github.com/Ozymandros/airspace-simulator.git
cd airspace-simulator
pnpm install
pnpm run dev
```

Open `http://localhost:8080` in a modern browser (Chrome, Firefox, Edge, or Safari).

### Docker

**Development** (Vite with hot reload):

```bash
docker compose up dev
```

Open `http://localhost:8080`.

**Production** (nginx serving built assets):

```bash
docker compose up web --build
```

Open `http://localhost:8081`.

Build the production image manually:

```bash
docker build --target production -t airspace-simulator .
docker run --rm -p 8081:80 airspace-simulator
```

### Dev Container (VS Code / Cursor)

1. Open the repository in VS Code or Cursor.
2. Run **Dev Containers: Reopen in Container** from the command palette.
3. The `dev` container starts the Vite dev server automatically.
4. Open the forwarded port **8080** when prompted.

The dev container uses the `dev` service from `docker-compose.yml` with your workspace mounted at `/workspace`.

### GitHub Pages

Live demo: **https://ozymandros.github.io/airspace-simulator/**

Pushes to `main` deploy automatically via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

**One-time repo setup:**

1. Open **Settings → Pages** in the GitHub repository.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

**Test the Pages build locally:**

```bash
pnpm run preview:pages
```

Open `http://localhost:8080/airspace-simulator/` (note the repo subpath).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm run dev` | Start Vite dev server on port 8080 |
| `pnpm run build` | Type-check and build for production (`dist/`) |
| `pnpm run build:pages` | Build with `/airspace-simulator/` base path (same as CI) |
| `pnpm run preview` | Preview the production build locally |
| `pnpm run preview:pages` | Build and preview the GitHub Pages bundle locally |
| `pnpm test` | Run unit tests |
| `pnpm run test:coverage` | Run tests with coverage report |
| `pnpm run test:watch` | Run tests in watch mode |

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

While paused, aircraft and clouds freeze but you can still orbit the camera in free mode.

## How It Works

### Rendering (Three.js)

- Perspective camera with damped orbit controls
- Procedural terrain mesh with vertex-colored grass, rock, and snow
- Instanced trees and houses scattered outside the airspace footprint
- Low-poly classical biplane models with emissive highlighting when tracked
- Line-based flight trails and soft fog for depth

### Steering (Yuka)

Each aircraft is a Yuka `Vehicle` with combined steering behaviors: wander, separation, alignment, cohesion, containment, and altitude wander. Each plane gets a random cruise speed and per-aircraft minimum airspeed floor.

### Airspace

The operational volume is a **200-unit cube** centered at the origin. Terrain directly beneath stays flat so mountains never intrude into the box.

### Tests

Unit tests cover simulation math, steering behaviors, terrain generation, UI state, and GitHub Pages base-path logic using [Vitest](https://vitest.dev/). Three.js rendering and the main animation loop are intentionally excluded — those are exercised manually in the browser.

```bash
pnpm test
pnpm run test:coverage
```

Coverage thresholds apply to the pure-logic modules in `src/simulation.ts`, `src/behaviors.ts`, `src/terrain.ts`, `src/ui.ts`, and related helpers.

## Project Structure

```
airspace-simulator/
├── .devcontainer/
│   └── devcontainer.json   # VS Code / Cursor dev container config
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages deployment
├── docker/
│   └── nginx.conf          # Production static file server
├── index.html              # App shell
├── Dockerfile              # Multi-stage: development, build, production
├── docker-compose.yml      # dev + web services
├── package.json
├── pnpm-lock.yaml
├── .npmrc                    # pnpm settings
├── serve.bat                 # Windows one-click dev server
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts             # Entry point
│   ├── styles.css          # UI styles
│   ├── constants.ts        # Shared constants
│   ├── simulation.ts       # Pure simulation helpers (tested)
│   ├── terrain.ts          # Procedural terrain height (tested)
│   ├── pages-base.ts       # GitHub Pages base path (tested)
│   ├── scene.ts            # Scene, camera, renderer, lights
│   ├── landscape.ts        # Terrain mesh, trees, houses, clouds
│   ├── behaviors.ts        # Yuka steering behaviors
│   ├── aircraft.ts         # Aircraft model and AI setup
│   ├── sync.ts             # Yuka → Three.js transform sync
│   ├── ui.ts               # Fleet panel, follow mode, sim status
│   ├── input.ts            # Keyboard, mouse picking, wheel
│   ├── loop.ts             # Animation loop
│   └── test/setup.ts       # Vitest DOM setup
└── README.md
```

## Requirements

- Node.js 18+ with [pnpm](https://pnpm.io/) 9 (`corepack enable`), **or** Docker / Dev Containers
- A modern browser with WebGL support

## Browser Compatibility

Tested behavior targets current versions of Chromium, Firefox, and WebKit-based browsers. WebGL must be enabled.

## License

No license file is included yet. Add one if you plan to open-source or share this project publicly.
