import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { MainLayout } from "@/components/layouts/main-layout";

export const metadata: Metadata = {
  title: "AI App Marketplace - COSMARA",
  description: "Your AI-powered application marketplace with BYOK support",
  keywords: ["AI", "API", "marketplace", "BYOK", "applications"],
  authors: [{ name: "COSMARA" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
