import type { Metadata } from "next";
import { Geist_Mono, Nunito } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getSession } from "@/lib/auth/session";
import { BRAND } from "@/lib/brand";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
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

// Cada página declara solo su sección ("Estudiantes") y la plantilla le
// agrega la marca: "Estudiantes · Kinesis".
export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} · ${BRAND.descriptor}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  return (
    // suppressHydrationWarning: el script de <head> agrega data-mode,
    // data-accent y, con color personalizado, un style a <html> antes de que
    // React hidrate. Ver "Preventing flash before hydration" en la guía de Next.
    <html
      lang="es"
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-background">
        <ThemeProvider>
          <SessionProvider session={session}>
            <AppChrome>{children}</AppChrome>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
