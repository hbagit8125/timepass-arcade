import localFont from "next/font/local";

// Self-hosted variable fonts. next/font preloads them and sizes the fallback
// font to match, so the page doesn't jump when they arrive.

export const outfit = localFont({
  src: "./fonts/outfit.woff2",
  weight: "100 900",
  variable: "--font-outfit",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const bricolage = localFont({
  src: "./fonts/bricolage-grotesque.woff2",
  weight: "200 800",
  variable: "--font-bricolage",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});
