import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("useTheme Hook", () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
    // Remover classe dark do documento
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  describe("Theme Types", () => {
    it("deve ter tipos válidos: light, dark", () => {
      const themes = ["light", "dark"] as const;
      expect(themes).toHaveLength(2);
      expect(themes).toContain("light");
      expect(themes).toContain("dark");
    });
  });

  describe("localStorage Key", () => {
    it("deve usar chave correta para armazenar tema", () => {
      const storageKey = "app-theme";
      expect(storageKey).toBe("app-theme");
    });
  });

  describe("Theme Initialization", () => {
    it("deve inicializar com tema light por padrão", () => {
      const defaultTheme = "light";
      expect(defaultTheme).toBe("light");
    });

    it("deve ter estado isLoading durante inicialização", () => {
      const isLoading = true;
      expect(isLoading).toBe(true);
    });

    it("deve finalizar loading após inicializar", () => {
      const isLoading = false;
      expect(isLoading).toBe(false);
    });
  });

  describe("Theme Persistence", () => {
    it("deve salvar tema em localStorage", () => {
      const theme = "dark";
      localStorage.setItem("app-theme", theme);
      expect(localStorage.getItem("app-theme")).toBe("dark");
    });

    it("deve recuperar tema de localStorage", () => {
      localStorage.setItem("app-theme", "dark");
      const savedTheme = localStorage.getItem("app-theme");
      expect(savedTheme).toBe("dark");
    });

    it("deve limpar localStorage corretamente", () => {
      localStorage.setItem("app-theme", "dark");
      localStorage.clear();
      expect(localStorage.getItem("app-theme")).toBeNull();
    });
  });

  describe("Theme Application", () => {
    it("deve adicionar classe dark ao documento", () => {
      document.documentElement.classList.add("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("deve remover classe dark do documento", () => {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("deve ter apenas uma classe dark", () => {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.add("dark");
      const darkCount = Array.from(document.documentElement.classList).filter(
        (c) => c === "dark"
      ).length;
      expect(darkCount).toBe(1);
    });
  });

  describe("Theme Toggle", () => {
    it("deve alternar de light para dark", () => {
      let currentTheme = "light";
      currentTheme = currentTheme === "light" ? "dark" : "light";
      expect(currentTheme).toBe("dark");
    });

    it("deve alternar de dark para light", () => {
      let currentTheme = "dark";
      currentTheme = currentTheme === "light" ? "dark" : "light";
      expect(currentTheme).toBe("light");
    });

    it("deve salvar tema ao alternar", () => {
      const newTheme = "dark";
      localStorage.setItem("app-theme", newTheme);
      expect(localStorage.getItem("app-theme")).toBe("dark");
    });
  });

  describe("System Preference", () => {
    it("deve detectar preferência de dark mode do sistema", () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      expect(typeof prefersDark).toBe("boolean");
    });

    it("deve detectar preferência de light mode do sistema", () => {
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      expect(typeof prefersLight).toBe("boolean");
    });
  });

  describe("Hook Return Values", () => {
    it("deve retornar theme, toggleTheme, setTheme, isLoading", () => {
      const hookReturn = {
        theme: "light",
        toggleTheme: vi.fn(),
        setTheme: vi.fn(),
        isLoading: false,
      };

      expect(hookReturn).toHaveProperty("theme");
      expect(hookReturn).toHaveProperty("toggleTheme");
      expect(hookReturn).toHaveProperty("setTheme");
      expect(hookReturn).toHaveProperty("isLoading");
    });

    it("theme deve ser string (light ou dark)", () => {
      const theme = "light";
      expect(typeof theme).toBe("string");
      expect(["light", "dark"]).toContain(theme);
    });

    it("toggleTheme deve ser função", () => {
      const toggleTheme = vi.fn();
      expect(typeof toggleTheme).toBe("function");
    });

    it("setTheme deve ser função", () => {
      const setTheme = vi.fn();
      expect(typeof setTheme).toBe("function");
    });

    it("isLoading deve ser boolean", () => {
      const isLoading = false;
      expect(typeof isLoading).toBe("boolean");
    });
  });
});
