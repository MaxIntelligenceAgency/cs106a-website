import { Section } from "./Section";

export function Perception() {
  return (
    <Section id="perception" eyebrow="06 · Perception" title="Two front ends produce the same kind of control signal.">
      <p className="lede">ArUco mode and face mode are different at the detector level, but both become target-error signals that the controller can servo on.</p>
      <div className="twoCol">
        <div className="card"><h3>ArUco marker tracking</h3><p>OpenCV detects the printed marker ID, estimates pose with camera intrinsics, and publishes <code>/aruco/pose_3d</code>.</p></div>
        <div className="card"><h3>YOLOv8 face tracking</h3><p>YOLOv8 detects the face box and publishes normalized horizontal/vertical offset plus face area on <code>/face/pose</code>.</p></div>
      </div>
    </Section>
  );
}

export function Safety() {
  const states = ["IDLE", "ARM", "FOLLOW", "SEARCH", "LAND"];
  return (
    <Section id="safety" eyebrow="07 · Control + Safety" title="Visual servoing is wrapped in a safety state machine.">
      <p className="lede">Target error drives yaw, height, lateral, and distance commands. The drone does not take off from a single noisy detection, does not follow stale data indefinitely, and lands after prolonged target loss.</p>
      <div className="stateRow">{states.map((s, i) => <div className="state" key={s}><span>{String(i + 1).padStart(2, "0")}</span><strong>{s}</strong></div>)}</div>
    </Section>
  );
}
