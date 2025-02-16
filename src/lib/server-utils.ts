import { invoke } from "@tauri-apps/api/core";
import type { Server } from "./types";

export async function fetchServerMetadata(address: string, port?: number): Promise<Server> {
  try {
    console.log(`Checking server: ${address}${port ? `:${port}` : ''}`);
    
    const metadata = await invoke<{
      name: string;
      motd: string;
      version: string;
      player_count: number;
      max_players: number;
      players: string[];
      favicon_url: string | null;
      is_online: boolean;
      latency: number;
      server_type: 'Java' | 'Bedrock';
    }>('get_server_metadata', { 
      address,
      port 
    });
    
    return {
      id: Math.random(), // Generate unique ID
      name: metadata.name,
      motd: metadata.motd,
      version: metadata.version,
      playerCount: metadata.player_count,
      maxPlayers: metadata.max_players,
      imageUrl: metadata.favicon_url || undefined,
      isSponsored: false,
      onlinePlayers: metadata.players,
      isOnline: metadata.is_online,
      latency: metadata.latency,
      serverType: metadata.server_type
    };
  } catch (error) {
    console.error('Failed to fetch server metadata:', error);
    throw error;
  }
} 