import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, Users, Star } from "lucide-react";
import { useState } from "react";
import { AddServerDialog } from "./AddServerDialog";
import type { Server } from "../../lib/types";
import { SponsoredServers } from "./SponsoredServers";
import { LoginDialog } from "./Login";

// Update mock data to include all required fields
const servers: Server[] = [
  {
    id: 1,
    name: "Hypixel Network",
    motd: "The Best Minecraft Server Network",
    version: "1.8.9 - 1.20.2",
    playerCount: 88542,
    maxPlayers: 100000,
    imageUrl: "https://example.com/hypixel.png",
    isSponsored: true,
    onlinePlayers: ["Player1", "Player2", "Player3", "Player4", "Player5"],
    isOnline: true,
    latency: 50,
    serverType: "Java"
  },
  {
    id: 2,
    name: "Mineplex",
    motd: "Epic Minigames & More!",
    version: "1.19.4",
    playerCount: 12453,
    maxPlayers: 20000,
    imageUrl: "https://example.com/mineplex.png",
    isSponsored: true,
    onlinePlayers: ["Player1", "Player2", "Player3"],
    isOnline: true,
    latency: 45,
    serverType: "Java"
  },
];

function ServerCard({ server }: { server: Server }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Server Icon */}
          <div className="w-24 h-24 rounded-lg bg-secondary flex-shrink-0">
            <img 
              src={server.imageUrl} 
              alt={server.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Server Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold">{server.name}</h3>
              {server.isSponsored && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Sponsored
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-2">
              {server.motd}
            </p>
            
            <div className="flex gap-4">
              <Badge variant="outline">{server.version}</Badge>
              <Badge variant="secondary">{server.serverType}</Badge>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{server.playerCount}/{server.maxPlayers}</span>
              </div>
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
                    <ChevronUp className="h-4 w-4" />
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

export function MainContent() {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Minecraft Servers</h1>
          <div className="flex gap-2">
            <LoginDialog />
            <AddServerDialog />
          </div>
        </div>
        
        <div className="grid gap-4">
          {/* Sponsored Servers */}
          <SponsoredServers />

          {/* Regular Servers */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Servers</h2>
            {servers
              .filter(server => !server.isSponsored)
              .map(server => (
                <ServerCard key={server.id} server={server} />
              ))
            }
          </div>
        </div>
      </div>
    </main>
  );
}
