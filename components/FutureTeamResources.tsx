import { team } from "@/data/team";
import { appendixRows, launchFiles, showcaseResources } from "@/data/resources";
import { project } from "@/data/project";
import { Section } from "./Section";

export function Future() {
  const items = ["Voice-selectable tracking", "Multi-follower formation", "Better range sensing", "Lightweight edge inference"];
  return <Section id="future" eyebrow="10 · Future Work / Conclusion" title="What would make the system safer and more capable?"><div className="grid4">{items.map((item) => <div className="card" key={item}><h3>{item}</h3><p>Realistic next step for making the system more flexible, safer, or easier to deploy.</p></div>)}</div><p className="lede">The project met its core design goal: a real Tello drone can autonomously follow a visual target through a ROS2 perception-control pipeline while enforcing basic safety behaviors.</p></Section>;
}

export function Team() {
  return <Section id="team" eyebrow="11 · Team Contributions" title="Who built what."><div className="grid4">{team.map((m) => <div className="card" key={m.name}><span className="avatar">{m.initials}</span><h3>{m.name}</h3><p>{m.role}</p><p>{m.contribution}</p></div>)}</div></Section>;
}

export function Resources() {
  return (
    <Section id="resources" eyebrow="12 · Resources / Additional Materials" title="Where to verify the project and explore the appendix.">
      <h3>Project showcase materials</h3>
      <div className="twoCol">
        {showcaseResources.map((resource) => <div className="card" key={resource.title}><h3>{resource.title}</h3><p>{resource.description}</p>{"links" in resource && resource.links?.map((l) => <a key={l.href} href={l.href}>{l.label} </a>)}{resource.cta && <span className="button">{resource.cta}</span>}</div>)}
      </div>
      <div className="twoCol"><div className="card"><h3>Code Repository</h3><a href={project.repoUrl}>ROS2 / Gazebo GitHub repository</a></div><div className="card"><h3>Launch Files</h3><p>{launchFiles.map((file) => <code key={file}>{file} </code>)}</p></div></div>
      <table><tbody>{appendixRows.map(([name, detail]) => <tr key={name}><th>{name}</th><td>{detail}</td></tr>)}</tbody></table>
      <div className="twoCol"><div className="card"><h3>tello-station.sh</h3><p>Switches a Tello from AP mode into station mode by sending SDK UDP commands after checking Wi-Fi, reachability, and battery.</p></div><div className="card"><h3>tt_show_aruco.py</h3><p>Generates an 8×8 OpenCV ArUco pattern and sends RoboMaster TT LED matrix commands so the drone can display a trackable marker.</p></div></div>
    </Section>
  );
}
