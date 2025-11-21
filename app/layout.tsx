import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

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
  title: "Happy Holidays - Book Your Perfect Stay",
  description:
    "Experience unparalleled luxury and comfort at our premium hotel. Book your perfect room or event hall today.",
  keywords: [
    "Happy Holidays",
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
        {/* Firebase reCAPTCHA Enterprise script for phone authentication */}
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY}`}
          strategy="beforeInteractive"
          onLoad={() => {
            console.log("✅ [SCRIPT] reCAPTCHA Enterprise script loaded", {
              enterpriseKey: process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY,
              scriptSrc: `https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY}`,
              hasGrecaptcha: typeof window !== 'undefined' && !!(window as any).grecaptcha,
              grecaptchaEnterprise: typeof window !== 'undefined' && !!(window as any).grecaptcha?.enterprise
            });
          }}
          onError={(e) => {
            console.error("❌ [SCRIPT] Failed to load reCAPTCHA Enterprise script", e);
          }}
        />

        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
