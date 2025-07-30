import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Auth0Provider } from "@auth0/nextjs-auth0";
// import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI App Marketplace",
  description: "Your AI-powered application marketplace with BYOK support",
  keywords: ["AI", "API", "marketplace", "BYOK", "applications"],
  authors: [{ name: "AI App Marketplace Team" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Auth0Provider>
          {children}
          {/* <Toaster position="bottom-right" /> */}
        </Auth0Provider>
      </body>
    </html>
  );
}