import { createContext, useContext, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type Theme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  isLoading: true,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from settings on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        console.log("Loading theme from settings...");
        const savedTheme = await invoke<string | null>("get_setting", { 
          key: "theme"
        });
        
        console.log("Loaded theme:", savedTheme);
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTheme();
  }, []);

  // Save theme changes to settings
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    console.log("Saving theme:", theme);
    invoke("set_setting", { 
      key: "theme", 
      value: theme 
    })
      .then(() => console.log("Theme saved successfully"))
      .catch((error) => console.error("Failed to save theme:", error));

    // Update document class
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme, isLoading]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      console.log("Setting theme to:", theme);
      setTheme(theme);
    },
    isLoading,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}; 