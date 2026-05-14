import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autonomous Safe Drone Convoy Following · CS 106A",
  description:
    "A ROS2-based visual servoing case study for a DJI/Ryze Tello drone using ArUco tracking, YOLOv8 face tracking, and safety-aware control.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
