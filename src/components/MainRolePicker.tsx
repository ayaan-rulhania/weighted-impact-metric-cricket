import { MAIN_ROLES, type MainRole } from "../lib/wim";

const LABELS: Record<MainRole, string> = {
  batter: "Batter",
  bowler: "Bowler",
  allrounder: "All-rounder",
};

type Props = {
  value: MainRole;
  onChange: (role: MainRole) => void;
};

export function MainRolePicker({ value, onChange }: Props) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-[0.65rem] font-bold uppercase tracking-widest text-foreground">Main skill</legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Main skill">
        {MAIN_ROLES.map((role) => {
          const selected = value === role;
          return (
            <button
              key={role}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(role)}
              className={[
                "min-h-12 rounded-full border-2 border-foreground px-4 font-outfit text-sm font-extrabold transition-all duration-300 ease-bounce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected
                  ? "bg-accent text-accentForeground shadow-pop"
                  : "bg-white text-foreground hover:bg-tertiary/40",
              ].join(" ")}
            >
              {LABELS[role]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
