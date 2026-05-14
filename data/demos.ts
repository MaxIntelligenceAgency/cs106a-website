export type Demo = {
  title: string;
  tag: string;
  caption: string;
  video: string;
  meta: string[];
};

export const demos: Demo[] = [
  {
    title: "Gazebo Simulation",
    tag: "Demo 01 · Simulation",
    caption: "Perception-control loop validated before real flight.",
    video: "/videos/ros-sim.mp4",
    meta: ["Gazebo Classic 11", "Simulated Tello camera", "/aruco/pose_3d → /drone1/cmd_vel"],
  },
  {
    title: "ArUco Following",
    tag: "Demo 02 · Real Tello",
    caption: "Real Tello follows a visual marker at a safe distance.",
    video: "/videos/cp_demo_a.mp4",
    meta: ["Real hardware", "Printed marker", "Pose-based PD-style tracking"],
  },
  {
    title: "YOLOv8 Face Tracking",
    tag: "Demo 03 · Real Tello",
    caption: "Real Tello detects a face, takes off after stable lock, centers, and follows.",
    video: "/videos/cp_face_a.mp4",
    meta: ["YOLOv8 face detector", "Stable face lock", "Face-area distance proxy"],
  },
];

export const resultMetrics = [
  { title: "Follow duration", text: "~30s stable following target for the final demo bar." },
  { title: "Safe distance", text: "Controller targets roughly 1.5m from the leader or face." },
  { title: "Target loss", text: "Short loss triggers search or hover; prolonged loss triggers auto-land." },
  { title: "Perception", text: "Marker-based ArUco pose and marker-free YOLOv8 face tracking." },
];
