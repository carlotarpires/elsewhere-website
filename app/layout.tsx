import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const image = `${protocol}://${host}/og.png`;

  return {
    title: "Elsewhere — Chapter One",
    description: "A different kind of retreat. Be the first to know where Elsewhere is going.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/apple-touch-icon.png" },
    openGraph: {
      title: "Elsewhere — Chapter One",
      description: "A different kind of retreat. Be the first to know where we’re going.",
      type: "website",
      images: [{ url: image, width: 1747, height: 907, alt: "Elsewhere — Another place. Another way of living." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Elsewhere — Chapter One",
      description: "A different kind of retreat. Be the first to know where we’re going.",
      images: [image],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
