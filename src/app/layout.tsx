import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { FloatingDebugger } from "@/modules/observability/FloatingDebugger";
import { StoreProvider } from "@/components/layout/StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Instagram Activity Dashboard",
  description: "Professional Instagram Activity Dashboard & Tracker Extension",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white relative">
        {/* Background ambient light */}
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-900 blur-[120px]" />
        </div>

        <StoreProvider>
          <div className="flex h-screen overflow-hidden relative z-0">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64 overflow-hidden relative">
              <Topbar />
              <main className="flex-1 overflow-y-auto p-8 relative">
                {children}
              </main>
            </div>
          </div>
        </StoreProvider>

        <FloatingDebugger />
      </body>
    </html>
  );
}
