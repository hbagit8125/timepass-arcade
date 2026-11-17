"use client";

import Link from "next/link";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";
import { useArcade } from "@/lib/store";

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try {
    localStorage.setItem("timepass-theme", next);
  } catch {}
}

const iconButton =
  "glass grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-strong";

export function Header() {
  const muted = useArcade((s) => s.muted);
  const toggleMuted = useArcade((s) => s.toggleMuted);

  // Load saved scores, favourites and settings once the page is interactive.
  useEffect(() => {
    void Promise.resolve(useArcade.persist.rehydrate()).then(() =>
      useArcade.setState({ ready: true }),
    );
  }, []);

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8 sm:py-4">
      <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight">
        <span aria-hidden className="grid grid-cols-2 gap-[3px]">
          <i className="size-2.5 rounded-[3px] bg-puzzle" />
          <i className="size-2.5 rounded-[3px] bg-arcade" />
          <i className="size-2.5 rounded-[3px] bg-classic" />
          <i className="size-2.5 rounded-[3px] bg-reflex" />
        </span>
        Timepass Arcade
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMuted}
          className={iconButton}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          aria-pressed={muted}
        >
          {muted ? <VolumeX className="size-[18px]" /> : <Volume2 className="size-[18px]" />}
        </button>
        <button type="button" onClick={toggleTheme} className={iconButton} aria-label="Switch between dark and light theme">
          <Sun className="hidden size-[18px] dark:block" />
          <Moon className="size-[18px] dark:hidden" />
        </button>
      </div>
    </header>
  );
}
