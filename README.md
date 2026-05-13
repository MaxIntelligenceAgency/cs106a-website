# Autonomous Safe Drone Following · CS 106A

Production full-stack site for our EE/CS 106A Spring 2026 final project. The
original static HTML/CSS/JavaScript experience is preserved in `public/`, with a
Node server, metadata APIs, build validation, and smoke tests around it.

**Live:** https://cs106a-drone-convoy.vercel.app

## What this repo contains

- `public/` — the production frontend split into HTML, CSS, and JavaScript
- `src/server/` — dependency-free Node HTTP server for static assets and APIs
- `src/content/` — structured project metadata used by the API
- `scripts/build.js` — validates and copies frontend/video assets into `dist/`
- `test/` — Node test runner smoke tests for the server and API
- `videos/` — the 5 demo clips referenced in the page (~15 MB)
- `tello-station.sh` — switches a Tello between AP and station mode (real hardware)
- `tt_show_aruco.py` — renders an ArUco marker onto a RoboMaster TT's 8×8 LED matrix

The actual ROS 2 / Gazebo project source lives in its own repo:
[Tyler6666666/106a_final_project](https://github.com/Tyler6666666/106a_final_project).

## Run locally

```bash
npm run dev
```

The app defaults to <http://127.0.0.1:3000>. Override with `PORT=8080 npm run dev`.

## Build, test, and run

```bash
npm run build
npm test
npm start
```

`npm start` serves `dist/public` in production after a build, while development
serves `public/` directly.

## API

- `GET /api/health` — service status and build metadata
- `GET /api/project` — structured project, team, architecture, and demo data
- `GET /api/demos` — demo video manifest

## Site structure

The page is organized as a static technical case study: story first, proof second, and appendix material last.

1. Hero · what the project is, core metrics, and a real Tello demo loop
2. Project Overview / Introduction · goal, motivation, hardware context
3. Results First · Gazebo, ArUco, and YOLOv8 face-tracking demos
4. System Design · ROS 2 perception → control → Tello actuation pipeline
5. Implementation · hardware, software stack, nodes, topics, and expandable code-stage appendix
6. Control + Safety · visual servoing and 5-state safety machine
7. Failure Modes + Fixes · six real issues with causes and mitigations
8. Future Work / Conclusion · limitations and next steps
9. Team Contributions · major contributions by member
10. Resources / Additional Materials · GitHub, slides placeholder, videos, package appendix, interactive sim, hardware bridges, and quickstart

— EE/CS 106A · Spring 2026
