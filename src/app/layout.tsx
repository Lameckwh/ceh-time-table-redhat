import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CEH Study Group",
  description: "A collaborative space for CEH exam preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
