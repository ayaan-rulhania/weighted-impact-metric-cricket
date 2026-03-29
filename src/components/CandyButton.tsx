import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type Props = {
  children: ReactNode;
  icon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function CandyButton({
  children,
  className = "",
  icon,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={[
        "group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-foreground bg-accent px-6 font-outfit text-sm font-extrabold text-accentForeground shadow-pop transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      ].join(" ")}
      {...rest}
    >
      <span>{children}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-accent">
        {icon ?? <ArrowRight className="h-4 w-4" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}
      </span>
    </button>
  );
}
