import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Schooli - School Management System",
  description: "Navigate the future of education with Schooli.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} bg-background text-text`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <Header />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
