import type { Metadata, Viewport } from "next";
import { Hind, Yatra_One } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

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
  appleWebApp: {
    capable: true,
    title: "Sukoon",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a1410",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
      <body className="min-h-full">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
