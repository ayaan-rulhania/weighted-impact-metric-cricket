import type { ReactNode } from "react";
import { PlaygroundDecor } from "./PlaygroundDecor";
import { TopNav } from "./TopNav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dot-grid relative min-h-screen">
      <PlaygroundDecor />
      <TopNav />
      <div>{children}</div>
    </div>
  );
}
