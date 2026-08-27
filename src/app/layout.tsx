import type { Metadata } from "next";
import {
  Allura,
  Cormorant_Garamond,
  Inter,
  Montserrat,
  Playfair_Display,
} from "next/font/google";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-editorial",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-clasica",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-contemporanea",
});

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-romantica",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "COMUNICA | EVENSSE",
  description:
    "Comunicación clara, justo cuando tus invitados la necesitan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`
        ${cormorant.variable}
        ${playfair.variable}
        ${montserrat.variable}
        ${allura.variable}
        ${inter.variable}
      `}
    >
      <body>{children}</body>
    </html>
  );
}