import type { Metadata, Viewport } from "next";
import { bricolage, outfit } from "./fonts";
import "./globals.css";
import { Header } from "@/components/Header";
import { OfflineReady } from "@/components/OfflineReady";

export const metadata: Metadata = {
  title: { default: "Timepass Arcade", template: "%s | Timepass Arcade" },
  description: "Twenty quick games for short breaks. No sign-up, nothing to install.",
  applicationName: "Timepass Arcade",
  appleWebApp: { capable: true, title: "Timepass", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#100e24",
};

// Runs before first paint so a saved light theme never flashes dark.
const themeScript = `try{var t=localStorage.getItem("timepass-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark";if(t==="light")addEventListener("DOMContentLoaded",function(){var m=document.querySelector('meta[name="theme-color"]');m&&m.setAttribute("content","#f4f1ff")})}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={`${outfit.variable} ${bricolage.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <OfflineReady />
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-5 py-8 text-sm text-muted sm:px-8">
          Scores and favourites are saved in this browser only. Once loaded, the games work offline.
        </footer>
      </body>
    </html>
  );
}
