import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Schooli - School Management System",
  description: "Navigate the future of education with Schooli.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${poppins.className}`}>
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
