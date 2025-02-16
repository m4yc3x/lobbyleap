import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MinecraftText } from "@/components/ui/minecraft-text";
import { Loader2, CheckCircle, Users } from "lucide-react";
import { useState } from "react";

import type { Server } from "@/lib/types";
import { fetchServerMetadata } from "@/lib/server-utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddServerDialog() {
  const [serverAddress, setServerAddress] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<Server | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkServer = async () => {
    if (!serverAddress) return;

    setIsChecking(true);
    setError(null);
    setCheckResult(null);

    try {
      const metadata = await fetchServerMetadata(serverAddress);
      setCheckResult(metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check server");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Check Server
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Check Server</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex gap-4">
            <Input
              placeholder="Server IP or address"
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkServer()}
            />
            <Button 
              onClick={checkServer}
              disabled={isChecking || !serverAddress}
            >
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Check"
              )}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500 px-1">
              {error}
            </div>
          )}

          {checkResult && (
            <div className="border rounded-lg p-4">
              <div className="flex gap-4">
                {/* Server Icon */}
                {checkResult.imageUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={checkResult.imageUrl} 
                      alt="Server Icon" 
                      className="w-16 h-16 rounded-lg bg-secondary"
                    />
                  </div>
                )}

                {/* Server Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{checkResult.name}</div>
                  <div className="text-sm mt-1">
                    <MinecraftText text={checkResult.motd} />
                  </div>
                </div>
              </div>

              {/* Server Details */}
              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <Badge variant="outline">{checkResult.version}</Badge>
                  <Badge variant="outline">{checkResult.serverType}</Badge>
                  <Badge variant="outline">
                    <Users className="w-4 h-4" />
                    <span>{checkResult.playerCount.toLocaleString()}/{checkResult.maxPlayers.toLocaleString()}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                </div>
                {checkResult.latency > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Latency: {checkResult.latency}ms
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
