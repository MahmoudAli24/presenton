import type { Metadata } from "next";
import localFont from "next/font/local";
import { Roboto, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MixpanelInitializer from "./MixpanelInitializer";
import { LayoutProvider } from "./(presentation-generator)/context/LayoutContext";
import { Toaster } from "@/components/ui/sonner";
const inter = localFont({
  src: [
    {
      path: "./fonts/Inter.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

const instrument_sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-sans",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-roboto",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://ahlan.ai"),
  title: "Ahlan - AI Presentation Generator",
  description:
    "AI presentation generator with custom layouts, multi-model support, and PDF/PPTX export.",
  keywords: [
    "AI presentation generator",
    "data storytelling",
    "data visualization tool",
    "AI data presentation",
    "presentation generator",
    "data to presentation",
    "interactive presentations",
    "professional slides",
  ],
  openGraph: {
    title: "Ahlan - AI Presentation Generator",
    description:
      "AI presentation generator with custom layouts, multi-model support, and PDF/PPTX export.",
    url: "https://ahlan.ai",
    siteName: "Ahlan",
    images: [
      {
        url: "https://ahlan.ai/ahlan-feature-graphics.png",
        width: 1200,
        height: 630,
        alt: "Ahlan Logo",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://ahlan.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahlan - AI Presentation Generator",
    description:
      "AI presentation generator with custom layouts, multi-model support, and PDF/PPTX export.",
    images: ["https://ahlan.ai/ahlan-feature-graphics.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${roboto.variable} ${instrument_sans.variable} antialiased`}
      >
        <Providers>
          <MixpanelInitializer>
            <LayoutProvider>
              {children}
            </LayoutProvider>
          </MixpanelInitializer>
        </Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
