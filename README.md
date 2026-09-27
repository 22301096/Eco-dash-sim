# EcoDash | African Logistics Simulator

A browser-based delivery simulator built with vanilla JavaScript and the HTML5 Canvas API. Pilot a solar-powered delivery drone across a stylized African landscape, dodging rivers, potholes, trees, and construction zones to deliver medical supplies to a rural clinic — before your battery or the clock runs out.

**[Play it live](#)** · No build step, no dependencies — just open `index.html`.

---

## Features

- **Real-time canvas simulation** with vector-based movement, acceleration, drag, and momentum
- **Battery management** — your drone drains power as it travels and recharges only at the solar station
- **Dynamic weather system** — Clear, Rain, and Dust Storm conditions rotate every 18 seconds, with dust storms adding wind that pushes your drone off course
- **Load-shedding mechanic** — the solar station periodically goes offline, forcing you to time your recharge stops
- **Obstacle collisions** — rivers, potholes, trees, and construction zones drain battery and knock back your drone on impact
- **Score system** — rewards speed, remaining battery, and distance efficiency; penalizes collisions
- **Persistent best score** via `localStorage`
- **Pause / restart / play-again flow** with dedicated start, pause, and game-over screens

## Controls

| Action | Keys |
|---|---|
| Move | `W` `A` `S` `D` or Arrow Keys |
| Pause / Resume | `Space` |
| Restart | `R` |

## Getting Started

No build tools or package manager required.

1. Clone the repo:
   ```bash
   git clone https://github.com/22301096/EcoDash-African-Logistics.git
   cd EcoDash-African-Logistics
   ```
2. Open `index.html` directly in a browser, **or** serve it locally (recommended, avoids any local file restrictions):
   ```bash
   npx serve .
   # or
   python3 -m http.server
   ```
3. Click **Start Mission** and deliver the supplies.

## Project Structure

```
EcoDash-African-Logistics/
├── index.html   # Page structure, HUD, and screen overlays (start / pause / game over)
├── style.css    # Visual theme, HUD styling, and screen/panel layout
├── script.js    # Game engine: Player, Obstacle, SolarStation, Particle, and Game classes
└── .vscode/
    └── launch.json
```

## How It Works

The game runs on a single `requestAnimationFrame` loop (`Game.loop`) that updates game state and redraws the canvas every frame:

- **`Player`** handles directional acceleration, drag, speed limiting, and battery drain proportional to distance traveled.
- **`Obstacle`** renders and defines collision geometry for rivers, potholes, trees, and construction zones.
- **`SolarStation`** recharges the player's battery when in range, unless load-shedding is active.
- **`Particle`** produces simple dust-storm visual effects.
- **`Game`** owns overall state (start / playing / paused / gameover), weather cycling, collision detection, scoring, and HUD updates.

## Tech Stack

- Vanilla JavaScript (ES6 classes, no frameworks)
- HTML5 Canvas API
- CSS3
