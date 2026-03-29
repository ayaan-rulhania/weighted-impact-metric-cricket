import type { ReactNode } from "react";

type Props = {
  title: string;
  accent?: "accent" | "secondary" | "tertiary";
  featured?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  /** Long-form content: skip hover rotate/scale for readability */
  disableHoverTilt?: boolean;
};

const headerBar: Record<NonNullable<Props["accent"]>, string> = {
  accent: "bg-accent",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
};

const hoverTilt =
  "transition-transform duration-300 ease-bounce hover:-rotate-1 hover:scale-[1.02] motion-reduce:hover:scale-100 motion-reduce:hover:rotate-0";

export function StickerCard({ title, accent = "accent", featured, icon, children, disableHoverTilt }: Props) {
  return (
    <article
      className={[
        "relative rounded-xl border-2 border-foreground bg-card p-6 pt-8",
        disableHoverTilt ? "" : hoverTilt,
        featured ? "shadow-card-featured" : "shadow-card-sticker",
      ].join(" ")}
    >
      <div
        className={[
          "absolute -top-5 left-6 flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground text-accentForeground shadow-pop",
          headerBar[accent],
        ].join(" ")}
      >
        {icon}
      </div>
      <h3 className="font-outfit text-xl font-extrabold tracking-tight text-foreground">{title}</h3>
      <div className="mt-4 min-w-0 space-y-4">{children}</div>
    </article>
  );
}
