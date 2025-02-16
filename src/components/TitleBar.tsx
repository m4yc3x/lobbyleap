import { useState, useEffect } from "react";
import { Window } from "@tauri-apps/api/window";
import { Minus, Square, X, Globe } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = Window.getCurrent();

  useEffect(() => {
    // Check initial window state
    appWindow.isMaximized().then(setIsMaximized);

    // Listen for window state changes
    const unlisten = appWindow.listen('tauri://window-maximized', () => {
      setIsMaximized(true);
    });

    const unlistenUnmax = appWindow.listen('tauri://window-unmaximized', () => {
      setIsMaximized(false);
    });

    return () => {
      unlisten.then(fn => fn());
      unlistenUnmax.then(fn => fn());
    };
  }, []);

  return (
    <div data-tauri-drag-region className="h-10 flex justify-between items-center border-b bg-background select-none sticky top-0 z-50">
      {/* App title/logo area */}
      <div data-tauri-drag-region className="px-4 flex items-center gap-2">
        <Globe data-tauri-drag-region className="h-4 w-4" />
        <span data-tauri-drag-region className="text-sm font-semibold">LobbyLeap</span>
      </div>

      {/* Window controls */}
      <div className="flex items-center">
        <ThemeToggle />
        <button
          onClick={() => appWindow.minimize()}
          className="inline-flex items-center justify-center h-10 w-10 text-muted-foreground hover:bg-muted transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="inline-flex items-center justify-center h-10 w-10 text-muted-foreground hover:bg-muted transition-colors"
        >
          <Square className={`h-4 w-4 ${isMaximized ? 'rotate-180' : ''}`} />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="inline-flex items-center justify-center h-10 w-10 text-muted-foreground hover:bg-red-600 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
