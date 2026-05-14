import { demos, resultMetrics } from "@/data/demos";
import { Section } from "./Section";

export function Results() {
  return (
    <Section id="results" eyebrow="04 · Results / Demo Videos" title="It worked in simulation and on the real Tello.">
      <p className="lede">Proof appears before implementation details: the perception → estimation → control loop was tested in Gazebo, then on real hardware with ArUco and YOLOv8 face tracking.</p>
      <div className="grid4">{resultMetrics.map((m) => <div className="card" key={m.title}><h3>{m.title}</h3><p>{m.text}</p></div>)}</div>
      <div className="demoGrid">
        {demos.map((demo) => (
          <article className="demoCard" key={demo.title}>
            <span className="tag">{demo.tag}</span>
            <h3>{demo.title}</h3>
            <p>{demo.caption}</p>
            <video src={demo.video} controls muted loop playsInline preload="metadata" />
            <p className="meta">{demo.meta.join(" · ")}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
