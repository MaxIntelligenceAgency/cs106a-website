export const project = {
  title: "Autonomous Safe Drone Convoy Following",
  subtitle:
    "A story-first technical case study: a real DJI/Ryze Tello follows a moving visual target with ArUco or YOLOv8 perception, ROS2 visual servoing, and explicit safety behavior when the camera or Wi-Fi link becomes unreliable.",
  course: "EECS / BioE / ME C106A · Spring 2026 · Final Project",
  repoUrl: "https://github.com/Tyler6666666/106a_final_project.git",
  productionUrl: "https://cs106a-drone-convoy.vercel.app",
};

export const navItems = [
  { label: "Overview", href: "#overview" },
  { label: "Proof", href: "#results" },
  { label: "System", href: "#system" },
  { label: "Perception", href: "#perception" },
  { label: "Safety", href: "#safety" },
  { label: "Failures", href: "#failures" },
  { label: "Team", href: "#team" },
  { label: "Resources", href: "#resources" },
];

export const metrics = [
  { value: "Real", label: "DJI/Ryze Tello hardware, not just slides" },
  { value: "2×", label: "ArUco pose + YOLOv8 face perception modes" },
  { value: "5", label: "Safety states: idle, arm, follow, search, land" },
  { value: "ROS2", label: "OpenCV · YOLOv8 · djitellopy · Python" },
];
