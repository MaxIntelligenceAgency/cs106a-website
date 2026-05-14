export type ShowcaseResource = {
  title: string;
  description: string;
  href?: string;
  cta?: string;
  links?: { label: string; href: string }[];
};

export const showcaseResources: ShowcaseResource[] = [
  {
    title: "Project Showcase Slides",
    description:
      "Google Slides deck used during the final showcase. Add the public URL when the deck is ready.",
    href: "",
    cta: "Add public Google Slides URL",
  },
  {
    title: "Demo Video Index",
    description: "Raw clips that back up the Results section.",
    links: [
      { label: "Gazebo Simulation", href: "/videos/ros-sim.mp4" },
      { label: "ArUco Following A", href: "/videos/cp_demo_a.mp4" },
      { label: "ArUco Following B", href: "/videos/cp_demo_b.mp4" },
      { label: "Face Tracking A", href: "/videos/cp_face_a.mp4" },
      { label: "Face Tracking B", href: "/videos/cp_face_b.mp4" },
    ],
  },
];

export const appendixRows = [
  ["README", "Local setup and deployment notes for the static site and external ROS2 repo."],
  ["ROS package structure", "drone_simulation, my_drone_vision, Gazebo launch files, perception nodes, and controller nodes in the GitHub repository."],
  ["Model files", "YOLOv8 weights are downloaded on first face-tracking launch; simulation models live in the ROS2/Gazebo workspace."],
  ["Tello documentation", "Tello SDK / UDP command references explain takeoff, land, emergency, battery, station mode, and RC control."],
  ["ArUco marker files", "tt_show_aruco.py renders a marker on the RoboMaster TT LED matrix; printed marker assets should be kept with demo materials."],
];

export const launchFiles = ["vision_control.launch.py", "tello_aruco.launch.py", "tello_face.launch.py"];
