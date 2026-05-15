import { metrics, project } from "@/data/project";

export function Hero() {
  const story = [
    ["01", "Start with proof", "Show real Tello footage before asking viewers to trust the architecture."],
    ["02", "Explain the bottleneck", "Low-cost hardware means monocular video, Wi-Fi latency, noisy perception, and no blind following."],
    ["03", "Land the systems win", "Two detectors feed one ROS2 control contract and one safety-aware bridge."],
  ];

  return (
    <header className="hero">
      <div className="container heroGrid">
        <div>
          <span className="eyebrow">{project.course}</span>
          <h1>{project.title}</h1>
          <p className="lede">{project.subtitle}</p>
          <div className="pillRow"><span>ArUco · 6-DoF</span><span>YOLOv8 · Face</span><span>ROS2 Humble</span><span>Safety state machine</span></div>
          <div className="ctaRow">
            <a className="button primary" href="#results">Watch demos →</a>
            <a className="button" href="#system">Trace the ROS2 pipeline</a>
            <a className="button" href={project.repoUrl} target="_blank" rel="noopener">Open GitHub</a>
          </div>
          <div className="heroStory" aria-label="Homepage narrative">
            {story.map(([step, title, text]) => (
              <div className="storyStep" key={step}>
                <span>{step}</span>
                <div><strong>{title}</strong><p>{text}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="heroVideo">
          <div className="videoTop">cp_face_a.mp4 · real Tello demo</div>
          <video src="/videos/cp_face_a.mp4" autoPlay muted loop playsInline preload="metadata" />
          <div className="videoCaption"><strong>Proof:</strong> real DJI/Ryze Tello hardware · stable lock → takeoff → center → follow</div>
        </div>
        <div className="metrics">
          {metrics.map((m) => <div className="metric" key={m.label}><strong>{m.value}</strong><span>{m.label}</span></div>)}
        </div>
      </div>
    </header>
  );
}
