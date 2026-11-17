"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { GameProps } from "./types";

// Each game is its own bundle, downloaded only when someone opens it.
export const GAME_COMPONENTS: Record<string, ComponentType<GameProps>> = {
  "2048": dynamic(() => import("./2048/Game2048"), { ssr: false }),
};
