import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import { QueryProvider } from "@/components/query-provider";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontDisplay = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Isométrica", template: "%s | Isométrica" },
  description: "Plataforma inteligente de evolução acadêmica para Engenharia",
  openGraph: {
    title: "Isométrica",
    description: "Plataforma inteligente de evolução acadêmica para Engenharia",
    type: "website",
    locale: "pt_BR",
    siteName: "Isométrica",
  },
  twitter: {
    card: "summary_large_image",
    title: "Isométrica",
    description: "Plataforma inteligente de evolução acadêmica para Engenharia",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} font-sans antialiased`}
    >
      <body>
        <Toaster richColors closeButton position="top-right" />
        <TooltipProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
