import { Button } from "@/components/ui/button";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from '@tauri-apps/api/event';
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MinecraftCredentials {
  uuid?: string;
  access_token?: string;
  username?: string;
}

export function LoginDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [credentials, setCredentials] = useState<MinecraftCredentials | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    // Check for stored credentials on mount
    checkStoredCredentials();

    // Check if monitoring is already running
    invoke<boolean>('is_monitoring').then(setIsMonitoring);

    // Listen for credential updates
    const unlisten = listen<MinecraftCredentials>('minecraft-credentials-updated', (event) => {
      console.log("Received credentials update:", event.payload);
      setCredentials(event.payload);
      setIsLoading(false);
      setIsMonitoring(false);
      setIsOpen(false);
    });

    // Listen for monitoring errors
    const unlistenError = listen<string>('minecraft-monitoring-error', (event) => {
      console.log("Monitoring error:", event.payload);
      setIsLoading(false);
      setIsMonitoring(false);
    });

    return () => {
      // Cleanup listeners
      unlisten.then(fn => fn());
      unlistenError.then(fn => fn());
    };
  }, []);

  const checkStoredCredentials = async () => {
    try {
      const uuid = await invoke<string>("get_setting", { key: "minecraft_uuid" });
      const accessToken = await invoke<string>("get_setting", { key: "minecraft_access_token" });
      const username = await invoke<string>("get_setting", { key: "minecraft_username" });

      if (uuid && accessToken && username) {
        setCredentials({ uuid, access_token: accessToken, username });
      }
    } catch (error) {
      console.error("Failed to load credentials:", error);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setIsMonitoring(true);
      
      // Start monitoring first
      await invoke('start_minecraft_monitoring');

    } catch (error) {
      console.error("Failed to launch Minecraft:", error);
      setIsLoading(false);
      setIsMonitoring(false);
      
      // Make sure monitoring is stopped if launch fails
      await invoke('stop_minecraft_monitoring');
    }
  };

  const handleCancel = async () => {
    try {
      await invoke('stop_minecraft_monitoring');
      setIsMonitoring(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to stop monitoring:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          {credentials ? (
            <>
              <Lock className="h-4 w-4" />
              {credentials.username}
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              Login
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Minecraft Login</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-8">
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-sm text-muted-foreground">
                Please open Minecraft to continue...
              </p>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="mt-4"
              >
                Cancel
              </Button>
            </>
          ) : credentials ? (
            <>
              <Lock className="h-12 w-12 text-primary" />
              <div className="text-center w-full space-y-4">
                <div>
                  <p className="font-medium">{credentials.username}</p>
                  <p className="text-sm text-muted-foreground">Logged in</p>
                </div>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">UUID</label>
                    <div className="relative">
                      <Input
                        value={credentials.uuid}
                        readOnly
                        className={showCredentials ? "" : "blur-sm"}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Access Token</label>
                    <div className="relative">
                      <Input
                        value={credentials.access_token}
                        readOnly
                        className={showCredentials ? "" : "blur-sm"}
                      />
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowCredentials(!showCredentials)}
                  >
                    {showCredentials ? (
                      <>
                        <EyeOffIcon className="h-4 w-4 mr-2" />
                        Hide Credentials
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Show Credentials
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Unlock className="h-12 w-12 text-primary" />
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full max-w-[200px]"
              >
                Launch Minecraft
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
