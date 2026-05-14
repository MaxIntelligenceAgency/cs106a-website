export type ArchitectureBlock = {
  step: string;
  label: string;
  title: string;
  subtitle: string;
  details: string[];
};

export const architectureBlocks: ArchitectureBlock[] = [
  {
    step: "01",
    label: "Camera",
    title: "Tello Camera Stream",
    subtitle: "720p Wi-Fi video from the DJI/Ryze Tello",
    details: ["Real onboard monocular camera", "Sends video frames over Wi-Fi", "Source for both ArUco and face-tracking modes"],
  },
  {
    step: "02",
    label: "Mode Selector",
    title: "Tracking Mode Selector",
    subtitle: "ArUco mode or YOLOv8 face mode",
    details: ["Selects which perception front end is active", "Future: person tracking and voice-command mode selection", "Only the perception source changes; downstream control stays shared"],
  },
  {
    step: "03",
    label: "Perception",
    title: "Perception Front End",
    subtitle: "OpenCV ArUco / YOLOv8 face detector",
    details: ["ArUco mode detects marker ID and estimates marker pose", "Face mode detects a face bounding box using YOLOv8", "Converts raw image observations into target measurements"],
  },
  {
    step: "04",
    label: "Pose Topic",
    title: "Target Pose Topic",
    subtitle: "/aruco/pose_3d or /face/pose",
    details: ["ArUco publishes marker pose to /aruco/pose_3d", "Face tracking publishes normalized face offset and area to /face/pose", "Both become target-error signals for control"],
  },
  {
    step: "05",
    label: "Smoothing",
    title: "Signal Conditioning",
    subtitle: "EMA · derivative LPF · deadband · stale-frame guard",
    details: ["Face mode uses EMA pose smoothing", "ArUco mode uses derivative low-pass filtering and stale-frame hold/decay", "Deadbands reduce jitter from small noisy errors"],
  },
  {
    step: "06",
    label: "Controller",
    title: "Visual Servo Controller",
    subtitle: "Target error → clipped Twist command",
    details: ["Computes yaw, vertical, lateral, and forward/backward commands", "Face mode uses center error and face-area distance servo", "ArUco mode uses pose-based PD-style tracking", "Outputs geometry_msgs/Twist on /cmd_vel"],
  },
  {
    step: "07",
    label: "Safety",
    title: "Safety State Machine",
    subtitle: "Stable lock → Follow → Search/Hover → Land",
    details: ["Waits for stable visual lock before takeoff", "Delays follow mode after takeoff", "Hovers/searches on short target loss", "Lands after prolonged target loss", "Uses /tello_action for takeoff, land, and emergency stop"],
  },
  {
    step: "08",
    label: "Tello Bridge",
    title: "Tello IO Bridge",
    subtitle: "/cmd_vel + /tello_action → djitellopy",
    details: ["Single node owns the Tello video and RC connection", "Prevents multiple nodes from fighting for drone hardware", "Converts ROS Twist commands into Tello RC UDP commands"],
  },
  {
    step: "09",
    label: "Motors",
    title: "Drone Actuation",
    subtitle: "RC UDP → motors",
    details: ["Tello executes forward/backward, vertical, and yaw commands", "Final real-hardware actuation layer"],
  },
];
