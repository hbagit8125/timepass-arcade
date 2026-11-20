"use client";

import Link from "next/link";
import { Download, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { useArcade } from "@/lib/store";

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f4f1ff" : "#100e24");
  try {
    localStorage.setItem("timepass-theme", next);
  } catch {}
}

// Chrome and Edge fire this when the site can be installed as an app.
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

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

  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPrompt);
    };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8 sm:py-4">
      <Link href="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap font-display text-lg font-bold tracking-tight sm:text-xl">
        <span aria-hidden className="grid grid-cols-2 gap-[3px]">
          <i className="size-2.5 rounded-[3px] bg-puzzle" />
          <i className="size-2.5 rounded-[3px] bg-arcade" />
          <i className="size-2.5 rounded-[3px] bg-classic" />
          <i className="size-2.5 rounded-[3px] bg-reflex" />
        </span>
        Timepass Arcade
      </Link>
      <div className="flex items-center gap-2">
        {installPrompt && (
          <button
            type="button"
            onClick={install}
            aria-label="Install app"
            className="glass inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors hover:bg-surface-strong sm:w-auto sm:px-3.5"
          >
            <Download className="size-[18px] sm:size-4" aria-hidden />
            <span className="hidden sm:inline">Install app</span>
          </button>
        )}
        <button
          type="button"
          onClick={toggleMuted}
          className={iconButton}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
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
