"use client";

import { useState } from "react";
import { architectureBlocks } from "@/data/architecture";
import { Section } from "./Section";

export function LinearSystemDiagram() {
  const [active, setActive] = useState(architectureBlocks[0]);
  return (
    <Section id="system" eyebrow="05 · System Architecture" title="Two perception modes, one target-pose interface, one safety-aware Tello bridge.">
      <p className="lede">Different perception sources feed the same ROS2 control contract. Each mode converts camera observations into target error, smooths the signal, computes a clipped Twist command, and sends it through one safety-aware Tello bridge for real drone actuation.</p>
      <div className="callout"><strong>Main system message:</strong> Different perception sources. Same target-pose interface. Same ROS2 control contract. Single safety-aware Tello bridge.</div>
      <div className="linearArch">
        <div className="linearFlow">
          {architectureBlocks.map((block) => (
            <button
              className={`linearNode ${active.step === block.step ? "active" : ""}`}
              type="button"
              key={block.step}
              onMouseEnter={() => setActive(block)}
              onFocus={() => setActive(block)}
              onClick={() => setActive(block)}
            >
              <span>{block.step}</span>
              <strong>{block.label}</strong>
              <small>{block.subtitle}</small>
            </button>
          ))}
        </div>
        <div className="linearDetail">
          <div><span className="eyebrow">Block {active.step}</span><h3>{active.title}</h3><p>{active.subtitle}</p></div>
          <ul>{active.details.map((d) => <li key={d}>{d}</li>)}</ul>
        </div>
      </div>
    </Section>
  );
}
