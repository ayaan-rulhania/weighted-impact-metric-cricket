import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>;

export function SecondaryButton({ children, className = "", type = "button", ...rest }: Props) {
  return (
    <button
      type={type}
      className={[
        "inline-flex min-h-12 items-center justify-center rounded-full border-2 border-foreground bg-transparent px-5 font-outfit text-sm font-bold text-foreground transition-all duration-300 ease-bounce hover:bg-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
