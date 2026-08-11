import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vera-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-vera-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vera Faith",
  description:
    "An experimental interactive music-themed developer portfolio — a private listening room for selected works.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--near-black)] text-[var(--cream)]">
        {children}
      </body>
    </html>
  );
}
