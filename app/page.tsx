import { Failures, Implementation } from "@/components/FailuresImplementation";
import { Future, Resources, Team } from "@/components/FutureTeamResources";
import { Hero } from "@/components/Hero";
import { Introduction, Motivation } from "@/components/IntroMotivation";
import { LinearSystemDiagram } from "@/components/LinearSystemDiagram";
import { Nav } from "@/components/Nav";
import { Perception, Safety } from "@/components/PerceptionSafety";
import { Results } from "@/components/Results";

export default function Page() {
  return (
    <>
      <Nav />
      <Hero />
      <main>
        <Introduction />
        <Motivation />
        <Results />
        <LinearSystemDiagram />
        <Perception />
        <Safety />
        <Failures />
        <Implementation />
        <Future />
        <Team />
        <Resources />
      </main>
      <footer className="footer"><div className="container">EE/CS 106A · Spring 2026 · Autonomous Safe Drone Convoy Following</div></footer>
    </>
  );
}
