import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { company } from "@/lib/demo-data";


export const metadata: Metadata = {
  title: "Ramp90 — Onboarding Orchestrator",
  description: "AI-assisted 30/60/90 onboarding with Slack, Google Calendar, Gmail and Notion. A People & Culture portfolio project.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-line py-6 text-center text-xs text-muted px-4">
          {company.name} is a fictional company. All people and data are synthetic. · Built by Claus as a People &amp; Culture portfolio project.
        </footer>
      </body>
    </html>
  );
}
