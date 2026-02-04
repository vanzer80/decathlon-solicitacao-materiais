import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme, isLoading } = useTheme();

  if (isLoading) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label={`Alternar para modo ${theme === "light" ? "escuro" : "claro"}`}
      title={`Modo ${theme === "light" ? "escuro" : "claro"}`}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-slate-600" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-400" />
      )}
    </Button>
  );
}
