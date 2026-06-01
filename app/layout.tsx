import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "J.A.R.V.I.S — Just A Rather Very Intelligent System",
  description: "AI Assistant powered by Claude — Iron Man HUD interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-hud-bg text-hud-text font-mono antialiased">
        {children}
      </body>
    </html>
  );
}
