import type { ChangeEvent, FormEvent, InputHTMLAttributes } from "react";

type Props = {
  label: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function LabeledInput({ label, hint, className = "", id, type, onChange, ...rest }: Props) {
  const inputId = id ?? `field-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;

  // For type="number", rely on `input` so value commits on every keystroke (some UAs defer `change`).
  const syncNumber = (e: FormEvent<HTMLInputElement>) => {
    if (!onChange) return;
    const el = e.currentTarget;
    onChange({
      ...e,
      target: el,
      currentTarget: el,
    } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-[0.65rem] font-bold uppercase tracking-widest text-foreground"
      >
        {label}
      </label>
      {hint ? <p className="text-xs text-mutedForeground">{hint}</p> : null}
      <input
        id={inputId}
        type={type}
        className={[
          "min-h-12 rounded-lg border-2 border-slate-300 bg-input px-3 py-2 font-jakarta text-sm font-medium text-foreground shadow-[4px_4px_0px_0px_transparent] outline-none transition-all duration-300 ease-bounce focus:border-accent focus:shadow-input-focus",
          className,
        ].join(" ")}
        {...rest}
        onChange={type === "number" ? undefined : onChange}
        onInput={type === "number" && onChange ? syncNumber : undefined}
      />
    </div>
  );
}
