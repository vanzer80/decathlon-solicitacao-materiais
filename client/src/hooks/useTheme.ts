import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "app-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar tema ao montar
  useEffect(() => {
    // 1. Verificar localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
      setIsLoading(false);
      return;
    }

    // 2. Verificar preferência do sistema
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const systemTheme: Theme = prefersDark ? "dark" : "light";
    setTheme(systemTheme);
    applyTheme(systemTheme);
    setIsLoading(false);
  }, []);

  // Aplicar tema ao documento
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Alternar tema
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme: Theme = prevTheme === "light" ? "dark" : "light";
      applyTheme(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      return newTheme;
    });
  };

  // Definir tema específico
  const setThemeExplicitly = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return {
    theme,
    toggleTheme,
    setTheme: setThemeExplicitly,
    isLoading,
  };
}
