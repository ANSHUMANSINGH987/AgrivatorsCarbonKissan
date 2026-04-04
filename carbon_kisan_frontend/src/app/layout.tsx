import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const sora = Sora({ 
  variable: "--font-sora", 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"] 
});

const jetbrainsMono = JetBrains_Mono({ 
  variable: "--font-jetbrains", 
  subsets: ["latin"],
  weight: ["400", "500"] 
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Carbon Kissan — Digital MRV Platform for Indian Farmers",
  description: "Turn your farm into a carbon asset. Measure, verify, and monetize your farm's carbon potential with satellite technology and AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
