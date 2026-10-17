"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  readPreferences,
  savePreferences,
  type ThemePreferences,
} from "@/lib/theme";

interface ThemeContextValue {
  preferences: ThemePreferences;
  update: (changes: Partial<ThemePreferences>) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// El script de <head> (THEME_INIT_SCRIPT) ya pintó el tema correcto antes
// de que React llegara. Este proveedor solo guarda los cambios y los vuelve a
// aplicar cuando hace falta: al cambiar el sistema operativo de claro a
// oscuro (modo "Sistema") y en desarrollo, donde el remontaje de Strict Mode
// borra los atributos que el script puso en <html>.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ThemePreferences>(() =>
    typeof window === "undefined" ? DEFAULT_PREFERENCES : readPreferences()
  );

  useLayoutEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    if (preferences.mode !== "system") return;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyPreferences(preferences);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preferences]);

  const update = useCallback((changes: Partial<ThemePreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...changes };
      savePreferences(next);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ preferences, update }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme debe usarse dentro de <ThemeProvider>.");
  return value;
}
