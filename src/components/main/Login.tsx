import { Button } from "@/components/ui/button";
import { Lock, Unlock, Loader2, Trash2 } from "lucide-react";
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
  uuid: string;
  access_token: string;
  username: string;
  gameDir: string;
  clientId: string;
  xuid: string;
  userType: string;
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
      const gameDir = await invoke<string>("get_setting", { key: "minecraft_game_dir" });
      const clientId = await invoke<string>("get_setting", { key: "minecraft_client_id" });
      const xuid = await invoke<string>("get_setting", { key: "minecraft_xuid" });
      const userType = await invoke<string>("get_setting", { key: "minecraft_user_type" });

      console.log("Loaded credentials:", {
        uuid, accessToken, username, gameDir, clientId, xuid, userType
      });

      // Only set credentials if we have the required fields and they're not empty strings
      if (uuid && accessToken && username && 
          uuid.trim() !== "" && 
          accessToken.trim() !== "" && 
          username.trim() !== "") {
        setCredentials({
          uuid,
          access_token: accessToken,
          username,
          gameDir,
          clientId,
          xuid,
          userType,
        });
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

  const handleDeleteCredentials = async () => {
    try {
      // Delete all credential-related settings
      await invoke("set_setting", { key: "minecraft_uuid", value: "" });
      await invoke("set_setting", { key: "minecraft_access_token", value: "" });
      await invoke("set_setting", { key: "minecraft_username", value: "" });
      await invoke("set_setting", { key: "minecraft_game_dir", value: "" });
      await invoke("set_setting", { key: "minecraft_client_id", value: "" });
      await invoke("set_setting", { key: "minecraft_xuid", value: "" });
      await invoke("set_setting", { key: "minecraft_user_type", value: "" });

      setCredentials(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to delete credentials:", error);
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
                        className={showCredentials ? "" : "blur-xs"}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Access Token</label>
                    <div className="relative">
                      <Input
                        value={credentials.access_token}
                        readOnly
                        className={showCredentials ? "" : "blur-xs"}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button autoFocus
                      variant="outline"
                      size="sm"
                      className="flex-1"
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
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={handleDeleteCredentials}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
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
