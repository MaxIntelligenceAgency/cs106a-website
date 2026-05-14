export const project = {
  slug: 'autonomous-safe-drone-convoy-following',
  title: 'Autonomous Safe Drone Convoy Following',
  course: 'EECS / BioE / ME C106A',
  term: 'Spring 2026',
  repo: 'https://github.com/Tyler6666666/106a_final_project.git',
  liveSite: 'https://cs106a-drone-convoy.vercel.app',
  summary:
    'A ROS 2 Tello stack that follows an ArUco marker or a tracked face with guarded takeoff, search, and auto-land behavior.',
  stats: [
    { label: 'Live demos', value: '3' },
    { label: 'Perception modes', value: '2' },
    { label: 'Drone self-funded', value: '$100' },
    { label: 'Stable-tracking bar', value: '30 s' }
  ],
  team: [
    {
      initials: 'MW',
      name: 'Max Wang',
      role: 'CS · Cogsci',
      focus: 'ML and RL methods, autonomous driving, humanoids'
    },
    {
      initials: 'TZ',
      name: 'Tianren (Tyler) Zeng',
      role: 'EECS',
      focus: 'Computer vision, GPS-free obstacle avoidance, humanoid RL'
    },
    {
      initials: 'GJ',
      name: 'Gia Jeong',
      role: 'ME',
      focus: 'Tactile sensing, suction-cup manipulation, autonomous systems'
    },
    {
      initials: 'YP',
      name: 'Yuanbo (Aaron) Pang',
      role: 'EECS',
      focus: 'VLA models on whole-body robots, UAV systems'
    }
  ],
  architecture: {
    modes: ['ArUco', 'Face'],
    nodes: [
      'tello_io_node',
      'aruco_detector_node',
      'follow_controller_node',
      'face_detector',
      'face_controller'
    ],
    topics: [
      '/tello/image_raw',
      '/target/pose',
      '/aruco/pose_3d',
      '/face/pose',
      '/cmd_vel',
      '/tello/action'
    ],
    safetyStates: ['IDLE', 'ARM', 'FOLLOW', 'SEARCH', 'LAND']
  },
  buildPlans: [
    {
      name: 'Mac-native ROS 2 Tello Follow',
      source: '../ee106a_final_project/.plans/PLAN.md',
      outcome:
        'Production ROS package with Tello I/O, ArUco detection, follow control, launch files, RViz config, and smoke tests.'
    },
    {
      name: 'Website full-stack migration',
      source: 'cs106a-website static HTML/CSS/JS',
      outcome:
        'Node production server, static frontend bundle, metadata APIs, health endpoint, build validation, and test coverage.'
    }
  ]
};

export const demos = [
  {
    id: 'ros-sim',
    title: 'Simulation checkpoint',
    mode: 'Gazebo / ROS 2',
    files: ['/videos/ros-sim.mp4']
  },
  {
    id: 'real-aruco',
    title: 'Real ArUco checkpoint',
    mode: 'Tello / ArUco',
    files: ['/videos/cp_demo_a.mp4', '/videos/cp_demo_b.mp4']
  },
  {
    id: 'face-follow',
    title: 'Face-follow stretch demo',
    mode: 'Tello / face tracking',
    files: ['/videos/cp_face_a.mp4', '/videos/cp_face_b.mp4']
  }
];

export function publicProjectPayload() {
  return {
    ...project,
    demos
  };
}
