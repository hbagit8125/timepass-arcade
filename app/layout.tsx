import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/outfit";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: { default: "Timepass Arcade", template: "%s | Timepass Arcade" },
  description: "Quick games for short breaks. No sign-up, nothing to install.",
};

export const viewport: Viewport = {
  themeColor: "#100e24",
};

// Runs before first paint so a saved light theme never flashes dark.
const themeScript = `try{var t=localStorage.getItem("timepass-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-5 py-8 text-sm text-muted sm:px-8">
          Scores and favourites are saved in this browser only.
        </footer>
      </body>
    </html>
  );
}
