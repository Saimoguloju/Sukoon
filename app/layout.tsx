import type { Metadata } from "next";
import { Hind, Yatra_One } from "next/font/google";
import "./globals.css";

const hind = Hind({
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin", "devanagari"],
});

const yatra = Yatra_One({
  variable: "--font-display",
  weight: ["400"],
  subsets: ["latin", "devanagari"],
});

export const metadata: Metadata = {
  title: "Sukoon सुकून — thoda sukoon, har din",
  description:
    "An Indian stress-relief web app — pranayama breathing, trataka flame gazing, monsoon & tanpura soundscapes, rangoli, calming incense smoke, and a daily mann check-in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hind.variable} ${yatra.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
