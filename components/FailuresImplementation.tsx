import { failures } from "@/data/failures";
import { Section } from "./Section";

export function Failures() {
  return (
    <Section id="failures" eyebrow="08 · Failure Modes + Fixes" title="Most of the work was safe behavior under unreliable perception.">
      <p className="lede">Most of the project was not just making the drone move; it was making the drone behave safely when perception became unreliable.</p>
      <div className="grid3">{failures.map((f) => <div className="card" key={f.title}><h3>{f.title}</h3><p><strong>Why:</strong> {f.problem}</p><p><strong>Fix:</strong> {f.fix}</p></div>)}</div>
    </Section>
  );
}

export function Implementation() {
  return (
    <Section id="implementation" eyebrow="09 · Implementation Details" title="What we built: hardware, software, nodes, and topics.">
      <div className="grid4">
        <div className="card"><h3>Hardware</h3><ul><li>DJI/Ryze Tello</li><li>Laptop ground station</li><li>Tello Wi-Fi link</li><li>Printed ArUco marker</li></ul></div>
        <div className="card"><h3>Software stack</h3><ul><li>ROS2 Humble</li><li>Python + OpenCV</li><li>YOLOv8</li><li>djitellopy</li></ul></div>
        <div className="card"><h3>ROS nodes</h3><ul><li><code>face_detector_node</code></li><li><code>face_controller_node</code></li><li>ArUco perception/controller nodes</li></ul></div>
        <div className="card"><h3>Topics / services</h3><ul><li><code>/face/pose</code></li><li><code>/cmd_vel</code></li><li><code>/tello_action</code></li><li><code>/aruco/pose_3d</code></li></ul></div>
      </div>
      <details className="appendix"><summary>Code / package structure appendix</summary><p>Keep detailed snippets here so the main report flow stays readable. The current static version contains the full Cursor-style code-stage viewer; this TSX structure maps that viewer into a future reusable component.</p></details>
    </Section>
  );
}
