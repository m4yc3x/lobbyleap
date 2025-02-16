// Minecraft color codes to CSS classes
const colorMap: Record<string, string> = {
  '0': 'text-black',
  '1': 'text-blue-800',
  '2': 'text-green-600',
  '3': 'text-cyan-600',
  '4': 'text-red-600',
  '5': 'text-purple-600',
  '6': 'text-yellow-500',
  '7': 'text-gray-500',
  '8': 'text-gray-600',
  '9': 'text-blue-500',
  'a': 'text-green-400',
  'b': 'text-cyan-400',
  'c': 'text-red-500',
  'd': 'text-pink-500',
  'e': 'text-yellow-300',
  'f': 'text-white',
};

// Formatting codes
/*const formatMap: Record<string, string> = {
  'k': 'font-minecraft-obfuscated',
  'l': 'font-bold',
  'm': 'line-through',
  'n': 'underline',
  'o': 'italic',
  'r': '' // Reset
};*/

export type MinecraftTextSection = {
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
}

export function parseMinecraftText(text: string): MinecraftTextSection[] {
  const sections: MinecraftTextSection[] = [];
  const parts = text.split('§');
  
  // Handle text before any formatting codes
  if (parts[0]) {
    sections.push({ text: parts[0] });
  }

  let currentFormat: Omit<MinecraftTextSection, 'text'> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    const code = part[0].toLowerCase();
    const text = part.slice(1);

    // Reset formatting
    if (code === 'r') {
      currentFormat = {};
    }
    // Color codes
    else if (colorMap[code]) {
      currentFormat = { ...currentFormat, color: colorMap[code] };
    }
    // Format codes
    else if (code === 'l') currentFormat.bold = true;
    else if (code === 'o') currentFormat.italic = true;
    else if (code === 'n') currentFormat.underline = true;
    else if (code === 'm') currentFormat.strikethrough = true;
    else if (code === 'k') currentFormat.obfuscated = true;

    if (text) {
      sections.push({ text, ...currentFormat });
    }
  }

  return sections;
} 