import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppHeader from "@/components/AppHeader";
import AppToaster from "@/components/AppToaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MergeLabel — Stamp CTA & merge PDFs",
  description:
    "MergeLabel by Green Bharat: stamp store QR CTAs on Meesho, Flipkart, and Amazon shipping labels, then merge into one PDF.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <AppHeader />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
          <p className="mx-auto max-w-5xl px-4 py-3 text-center text-xs text-[var(--muted)] sm:px-6">
            MergeLabel · stamp CTA · merge PDFs
          </p>
        </footer>
        <AppToaster />
      </body>
    </html>
  );
}
