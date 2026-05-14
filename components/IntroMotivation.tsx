import { Section } from "./Section";

export function Introduction() {
  return (
    <Section id="overview" eyebrow="02 · Introduction" title="What did we build?">
      <div className="twoCol">
        <p className="lede">We built a real leader-follower drone system on low-cost hardware. A DJI/Ryze Tello follower uses vision to lock onto a target, estimate target error, publish velocity commands, and recover safely when video or Wi-Fi communication becomes unreliable.</p>
        <div className="card"><h3>Hardware context</h3><ul><li>DJI/Ryze Tello</li><li>720p monocular camera</li><li>Laptop ground station</li><li>Tello UDP RC + Wi-Fi video</li><li>ROS2 Humble</li></ul></div>
      </div>
    </Section>
  );
}

export function Motivation() {
  const cards = [
    ["Limited sensing", "The Tello does not provide reliable onboard depth. ArUco pose and face-area signals act as practical distance proxies."],
    ["Networked control", "Video frames and RC commands move over Wi-Fi, so stale-frame guards and command clipping protect the control loop."],
    ["Swappable perception", "ArUco and YOLOv8 face tracking are different front ends, but both publish target-error signals into the same controller contract."],
    ["Safety is required", "The follower waits for stable visual lock, delays follow after takeoff, searches or hovers on short loss, and lands after prolonged loss."],
  ];
  return (
    <Section id="motivation" eyebrow="03 · Motivation" title="Making a cheap drone follow safely is a real systems problem.">
      <p className="lede">A one-off drone follow demo is easy to describe. Making it work safely on a low-cost Tello is harder: the drone has only monocular video, communicates over Wi-Fi, and cannot keep moving blindly when perception becomes unreliable.</p>
      <div className="callout"><strong>Problem statement:</strong> Can a consumer drone behave like a safe autonomous follower using only software perception, ROS2 messages, clipped velocity commands, and explicit failure handling?</div>
      <div className="grid4">{cards.map(([title, text]) => <div className="card" key={title}><h3>{title}</h3><p>{text}</p></div>)}</div>
    </Section>
  );
}
