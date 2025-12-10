import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Union Awas Happy Holiday - Book Your Perfect Stay",
  description:
    "Experience unparalleled Service and comfort at our premium hotel. Book your perfect room or event hall today.",
  keywords: [
    "Union Awas Happy Holiday",
    "premium accommodation",
    "hotel booking",
    "event halls",
  ],
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                closeButton: "!bg-white !text-gray-600 !border-gray-200 !w-8 !h-8 !p-2 hover:!bg-gray-100"
              }
            }}
          />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
