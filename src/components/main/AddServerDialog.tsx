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

  const normalizeAddress = (input: string): { address: string; port?: number } => {
    // Remove any protocol prefixes and trailing slashes
    let address = input.replace(/^(minecraft:\/\/|https?:\/\/)/i, '').trim();
    address = address.split('/')[0];

    // Check for explicit port
    const portMatch = address.match(/:(\d+)$/);
    if (portMatch) {
      const port = parseInt(portMatch[1], 10);
      address = address.slice(0, -portMatch[0].length);
      return { address, port };
    }

    // No port specified, let the backend handle default
    return { address };
  };

  const checkServer = async () => {
    if (!serverAddress) return;

    setIsChecking(true);
    setError(null);
    setCheckResult(null);

    try {
      const { address, port } = normalizeAddress(serverAddress);
      const metadata = await fetchServerMetadata(address, port);
      setCheckResult(metadata);
    } catch (err) {
      let errorMessage = "Failed to check server";
      
      if (err instanceof Error) {
        if (err.message.includes("connection refused")) {
          errorMessage = "Server is offline or port is blocked";
        } else if (err.message.includes("Could not resolve address")) {
          errorMessage = "Invalid server address";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
