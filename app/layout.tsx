import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CBSE School Data API",
  description:
    "An API to fetch CBSE school data including school details, principals, and contact information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` antialiased`}>{children}</body>
    </html>
  );
}
