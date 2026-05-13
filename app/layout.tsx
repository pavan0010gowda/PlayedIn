import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayedIn | Sports Economy OS",
  description: "The complete grassroots ecosystem for local athletes, coaches, and organizers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Forcing Tailwind CSS to load instantly for development */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          {`
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    background: '#080d10',
                  }
                }
              }
            }
          `}
        </script>
      </head>
      <body className="bg-[#080d10] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black min-h-screen">
        {children}
      </body>
    </html>
  );
}