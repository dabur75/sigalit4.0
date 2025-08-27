import type { Metadata } from "next";
import { Inter, Heebo } from "next/font/google";
import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import { NextAuthProvider } from "~/app/_components/NextAuthProvider";
import { HamburgerMenu } from "~/app/_components/navigation/HamburgerMenu";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew"],
  display: "swap",
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "Sigalit - מערכת ניהול שיבוצים",
  description: "מערכת מתקדמת לניהול שיבוצים ומדריכים",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" style={{background: '#fafafa'}}>
      <body className={`${inter.className} ${heebo.variable} font-heebo`} style={{background: '#fafafa', color: '#1f2937', minHeight: '100vh'}}>
        <NextAuthProvider>
          <TRPCReactProvider>
            {/* Global Hamburger Menu */}
            <div className="fixed top-4 left-4 z-50">
              <HamburgerMenu />
            </div>
            {children}
          </TRPCReactProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
