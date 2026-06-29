import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecommerce Storefront",
  description: "Reusable ecommerce frontend for a Laravel REST API backend.",
  openGraph: {
    title: "Ecommerce Storefront",
    description: "Reusable ecommerce frontend for a Laravel REST API backend.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ecommerce Storefront",
    description: "Reusable ecommerce frontend for a Laravel REST API backend.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-[#121212]">{children}</body>
    </html>
  );
}
