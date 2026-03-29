import { StickerCard } from "../components/StickerCard";

export default function TeamPage() {
  return (
    <div className="mx-auto min-w-0 max-w-content px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-16">
      <header className="mb-10 max-w-3xl">
        <p className="mb-2 inline-block rounded-full border-2 border-foreground bg-tertiary/35 px-3 py-1 font-jakarta text-xs font-bold uppercase tracking-widest text-foreground">
          Team
        </p>
        <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Team</h1>
        <p className="mt-3 font-jakarta text-sm font-medium text-mutedForeground">
          This section is reserved for project team information. Details will be added here soon.
        </p>
      </header>

      <StickerCard
        title="Coming soon"
        accent="tertiary"
        disableHoverTilt
        icon={<span className="material-symbols-outlined text-[22px] text-white">groups</span>}
      >
        <p className="font-jakarta text-sm font-medium leading-relaxed text-mutedForeground">
          Placeholder for bios, roles, credits, or collaborators behind WIM Cricket Engine.
        </p>
      </StickerCard>
    </div>
  );
}
