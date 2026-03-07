import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Erkhet Solar Tours LLC",
  description: "Tourism website for Erkhet Solar Tours LLC"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
