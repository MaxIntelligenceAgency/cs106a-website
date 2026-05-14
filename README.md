# Autonomous Safe Drone Convoy Following · CS 106A

Static one-page site for our EE/CS 106A Spring 2026 final project.

**Live:** https://cs106a-drone-convoy.vercel.app

## What this repo contains

- `index.html` — the entire site (all CSS + JS inline)
- `videos/` — the 5 demo clips referenced in the page (~15 MB)
- `tello-station.sh` — switches a Tello between AP and station mode (real hardware)
- `tt_show_aruco.py` — renders an ArUco marker onto a RoboMaster TT's 8×8 LED matrix
- `assets/` — static images

The actual ROS 2 / Gazebo project source lives in its own repo:
[Tyler6666666/106a_final_project](https://github.com/Tyler6666666/106a_final_project).

## Run locally

```bash
open index.html       # macOS — opens in default browser
# or
python3 -m http.server 8080
```

## Deploy

Hosted on Vercel as a static site. Any commit to `main` redeploys automatically
once the project is linked. Manual deploy:

```bash
vercel --prod
```

## Site structure

The page is organized as a static technical case study: story first, proof second, and appendix material last.

1. Hero · what the project is, core metrics, and a real Tello demo loop
2. Introduction · goal and system overview
3. Motivation · why noisy monocular video + Wi-Fi control is interesting
4. Results / Demo Videos · Gazebo, ArUco, and YOLOv8 face-tracking evidence
5. System Architecture · interactive linear pipeline from camera to motors
6. Perception · ArUco and YOLOv8 face modes with shared target-pose interface
7. Control + Safety · visual servoing and 5-state safety machine
8. Failure Modes + Fixes · six real issues with causes and mitigations
9. Implementation Details · hardware, software stack, nodes, topics, and expandable code-stage appendix
10. Future Work / Conclusion · limitations and next steps
11. Team Contributions · major contributions by member
12. Resources / Additional Materials · project showcase slides placeholder, demo video index, GitHub, launch files, package appendix, interactive sim, hardware bridges, and quickstart

## Vercel static site settings

For branch Preview Deployments and production deploys, this repository is a plain static site:

- Framework Preset: Other
- Root Directory: `./`
- Build Command: leave empty
- Output Directory: `./`
- Install Command: leave empty

— EE/CS 106A · Spring 2026
