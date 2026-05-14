import { metrics, project } from "@/data/project";

export function Hero() {
  return (
    <header className="hero">
      <div className="container heroGrid">
        <div>
          <span className="eyebrow">{project.course}</span>
          <h1>{project.title}</h1>
          <p className="lede">{project.subtitle}</p>
          <div className="pillRow"><span>ArUco · 6-DoF</span><span>YOLOv8 · Face</span><span>ROS2 Humble</span></div>
          <div className="ctaRow">
            <a className="button primary" href="#results">Watch demos</a>
            <a className="button" href="#system">System architecture</a>
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
