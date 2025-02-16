export interface Server {
  id: number;
  name: string;
  motd: string;
  version: string;
  playerCount: number;
  maxPlayers: number;
  imageUrl?: string;
  isSponsored: boolean;
  onlinePlayers: string[];
  isOnline: boolean;
  latency: number;
  serverType: 'Java' | 'Bedrock';
} 