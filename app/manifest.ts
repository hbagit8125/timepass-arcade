import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Timepass Arcade",
    short_name: "Timepass",
    description: "Twenty quick games for short breaks. No sign-up, and it works offline.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#100e24",
    theme_color: "#100e24",
    categories: ["games", "entertainment"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
