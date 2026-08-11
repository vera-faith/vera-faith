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
    "An interactive record collection — dreamy selected works by Vera Faith.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--ivory)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
