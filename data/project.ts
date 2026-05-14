export const project = {
  title: "Autonomous Safe Drone Convoy Following",
  subtitle:
    "A ROS2-based visual servoing system that lets a real DJI/Ryze Tello drone follow a target using ArUco tracking, YOLOv8 face tracking, and safety-aware control.",
  course: "EECS / BioE / ME C106A · Spring 2026 · Final Project",
  repoUrl: "https://github.com/Tyler6666666/106a_final_project.git",
  productionUrl: "https://cs106a-drone-convoy.vercel.app",
};

export const navItems = [
  { label: "Overview", href: "#overview" },
  { label: "Results", href: "#results" },
  { label: "System", href: "#system" },
  { label: "Control", href: "#safety" },
  { label: "Failures", href: "#failures" },
  { label: "Future", href: "#future" },
  { label: "Team", href: "#team" },
  { label: "Resources", href: "#resources" },
];

export const metrics = [
  { value: "Real", label: "DJI/Ryze Tello hardware" },
  { value: "2", label: "ArUco + YOLOv8 Face Tracking" },
  { value: "Control", label: "Visual servoing + safety state machine" },
  { value: "Stack", label: "ROS2 · OpenCV · YOLOv8 · djitellopy · Python" },
];
