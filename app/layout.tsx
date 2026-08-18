import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import { SessionProvider } from "@/components/SessionProvider";
import { getSession } from "@/lib/auth/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Planeación Inclusiva PIAR",
  description:
    "Plataforma para cruzar la planeación docente con los perfiles PIAR de los estudiantes y generar adaptaciones curriculares.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-muted/30">
        <SessionProvider session={session}>
          <AppChrome>{children}</AppChrome>
        </SessionProvider>
      </body>
    </html>
  );
}
