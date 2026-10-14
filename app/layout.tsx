import type { Metadata } from "next";
import { Geist_Mono, Nunito } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import { SessionProvider } from "@/components/SessionProvider";
import { getSession } from "@/lib/auth/session";
import "./globals.css";

// Nunito (opción 2 del comparador en referencias visuales/): una sola
// familia para títulos y texto. Es variable, así que trae todos los pesos de
// 200 a 1000 en un solo archivo — por eso no se declara `weight`.
const nunito = Nunito({
  variable: "--font-nunito",
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
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-muted/30">
        <SessionProvider session={session}>
          <AppChrome>{children}</AppChrome>
        </SessionProvider>
      </body>
    </html>
  );
}
