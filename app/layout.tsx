import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PSW Exam Prep | NACC Practice Quiz",
  description:
    "Practice for your NACC Personal Support Worker final exam with 224 randomized True/False and Multiple Choice questions. Includes answers and explanations.",
  keywords: ["PSW", "NACC", "Personal Support Worker", "exam prep", "practice quiz"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
