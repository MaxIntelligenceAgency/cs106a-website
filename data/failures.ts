export const failures = [
  {
    title: "Wi-Fi latency",
    problem: "Video/control delay made commands stale, especially through VM networking.",
    fix: "Stale-frame guards, timeout logic, and command clipping.",
  },
  {
    title: "Pose jitter / detection noise",
    problem: "ArUco and YOLO detections flickered frame to frame.",
    fix: "Face: EMA pose smoothing. ArUco: derivative LPF and deadband.",
  },
  {
    title: "Yaw oscillation",
    problem: "The drone overcorrected small horizontal target errors.",
    fix: "PD damping, deadband, lower gain, and speed limits.",
  },
  {
    title: "No true depth",
    problem: "The Tello has only monocular video.",
    fix: "ArUco marker pose or face-area distance proxy.",
  },
  {
    title: "Target loss",
    problem: "Occlusion or leaving the camera frame removes the visual signal.",
    fix: "Hover/search on short loss, then auto-land after prolonged loss.",
  },
  {
    title: "Multi-node Tello conflict",
    problem: "Multiple nodes cannot safely own the same video/control hardware path.",
    fix: "A single ROS-Tello bridge owns video, services, and RC command output.",
  },
];
