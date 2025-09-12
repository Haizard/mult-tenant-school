import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";
import Toaster from "../components/ui/Toaster";
import { AuthProvider } from "../contexts/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Login - Schooli",
  description: "Sign in to your School Management System account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      <Toaster />
    </AuthProvider>
  );
}
