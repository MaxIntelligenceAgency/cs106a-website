import { navItems, project } from "@/data/project";

export function Nav() {
  return (
    <nav className="nav">
      <div className="navInner">
        <div className="brand"><span className="brandMark">⌖</span>106A · Drone Convoy</div>
        <ul>
          {navItems.map((item) => <li key={item.href}><a href={item.href}>{item.label}</a></li>)}
        </ul>
        <a className="navCta" href={project.repoUrl} target="_blank" rel="noopener">GitHub →</a>
      </div>
    </nav>
  );
}
