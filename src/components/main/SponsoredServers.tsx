import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Users, Star, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MinecraftText } from "@/components/ui/minecraft-text";
import type { Server } from "@/lib/types";
import { fetchServerMetadata } from "@/lib/server-utils";
import { invoke } from "@tauri-apps/api/core";

// Hardcoded sponsored server addresses
const SPONSORED_SERVERS = [
  "mc.hypixel.net",
  "mc.advancius.net"
];

function ServerCard({ server }: { server: Server }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Server Icon */}
          <div className="w-24 h-24 rounded-lg bg-secondary flex-shrink-0">
            {server.imageUrl && (
              <img 
                src={server.imageUrl} 
                alt={server.name}
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>

          {/* Server Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold">{server.name}</h3>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                Sponsored
              </Badge>
            </div>

            <p className="text-muted-foreground mb-2">
              <MinecraftText text={server.motd} />
            </p>
            
            <div className="flex gap-4">
              <Badge variant="outline">{server.version}</Badge>
              <Badge variant="outline">{server.serverType}</Badge>
              <Badge variant="outline">
                <Users className="w-4 h-4" />
                <span>{server.playerCount.toLocaleString()}/{server.maxPlayers.toLocaleString()}</span>
              </Badge>
              {server.latency > 0 && (
                <span className="text-sm text-muted-foreground">
                  {server.latency}ms
                </span>
              )}
            </div>
          </div>

          {/* Connect Button */}
          <div className="flex flex-col gap-2">
            <Button className="px-8">Connect</Button>
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 rotate-180" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>

        {/* Player List */}
        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Online Players</h4>
              <ScrollArea className="h-[100px] w-full rounded-md border p-4">
                <div className="flex flex-wrap gap-2">
                  {server.onlinePlayers.map((player) => (
                    <Badge key={player} variant="secondary">
                      {player}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export function SponsoredServers() {
  const [isFeaturedExpanded, setIsFeaturedExpanded] = useState(true);
  const [sponsoredServers, setSponsoredServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load collapsed state from settings on mount
  useEffect(() => {
    async function loadCollapsedState() {
      try {
        const savedState = await invoke<string | null>("get_setting", { 
          key: "featured_collapsed"
        });
        if (savedState !== null) {
          setIsFeaturedExpanded(savedState === "false"); // "false" means expanded
        }
      } catch (error) {
        console.error("Failed to load featured collapsed state:", error);
      }
    }

    loadCollapsedState();
  }, []);

  // Save collapsed state when it changes
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    invoke("set_setting", { 
      key: "featured_collapsed", 
      value: (!isFeaturedExpanded).toString() // Store as string "true"/"false"
    })
      .catch((error) => console.error("Failed to save featured collapsed state:", error));
  }, [isFeaturedExpanded, isLoading]);

  // Fetch sponsored servers data on mount
  useEffect(() => {
    async function fetchSponsored() {
      try {
        const servers = await Promise.all(
          SPONSORED_SERVERS.map(async (address) => {
            try {
              return await fetchServerMetadata(address);
            } catch (error) {
              console.error(`Failed to fetch ${address}:`, error);
              return null;
            }
          })
        );

        setSponsoredServers(servers.filter((server): server is Server => server !== null));
      } catch (error) {
        console.error("Failed to fetch sponsored servers:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSponsored();
  }, []);

  return (
    <Collapsible 
      defaultOpen 
      open={isFeaturedExpanded} 
      onOpenChange={setIsFeaturedExpanded}
    >
      <div className={cn(
        "transition-all duration-300 ease-in-out origin-left",
        !isFeaturedExpanded && "w-fit scale-95 hover:scale-100"
      )}>
        <CollapsibleTrigger asChild>
          <Button 
            variant={isFeaturedExpanded ? "ghost" : "outline"} 
            className={cn(
              "w-full flex items-center gap-2 justify-start transition-all duration-300",
              isFeaturedExpanded && "hover:bg-transparent p-0 h-auto",
              !isFeaturedExpanded && "px-4 py-2 shadow-sm hover:shadow-md"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "transition-transform duration-300",
                !isFeaturedExpanded && "rotate-180"
              )}>
                <ChevronDown className="h-4 w-4" />
              </div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span>Featured Servers</span>
                <Sparkles className={cn(
                  "h-4 w-4 text-yellow-500 transition-all duration-300",
                  !isFeaturedExpanded && "scale-90"
                )} />
                <span className={cn(
                  "text-sm font-normal text-muted-foreground transition-all duration-300",
                  isFeaturedExpanded ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}>
                  ({sponsoredServers.length})
                </span>
              </h2>
            </div>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-4 mt-4 transition-all duration-300">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className={cn(
            "grid gap-4 transition-all duration-300",
            isFeaturedExpanded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}>
            {sponsoredServers.map(server => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
