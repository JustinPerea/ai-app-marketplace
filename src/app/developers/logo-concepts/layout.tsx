import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logo Concepts - COSMARA Developer Portal",
  description: "COSMARA logo evolution and design concepts for developers",
};

export default function LogoConceptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}