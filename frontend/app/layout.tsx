import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "EventFlow - Premium Order Experience",
  description: "Next-generation Event-Driven Order Processing System",
};

import AuthModal from "@/components/auth/AuthModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`antialiased min-h-screen bg-gray-950 flex flex-col selection:bg-blue-500/30 selection:text-blue-200`}
      >
        <Providers>
          <AuthModal />
          <Navbar />
          <main className="flex-1 pt-24">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
