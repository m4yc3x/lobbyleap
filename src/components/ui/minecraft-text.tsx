import { cn } from "@/lib/utils";
import { MinecraftTextSection, parseMinecraftText } from "@/lib/minecraft";
import { useEffect, useState } from "react";

const OBFUSCATED_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function ObfuscatedText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayText(text.split('').map(() => 
        OBFUSCATED_CHARS[Math.floor(Math.random() * OBFUSCATED_CHARS.length)]
      ).join(''));
    }, 50);

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
}

function MinecraftTextPart({ section }: { section: MinecraftTextSection }) {
  const className = cn(
    section.color,
    section.bold && "font-bold",
    section.italic && "italic",
    section.underline && "underline",
    section.strikethrough && "line-through"
  );

  if (section.obfuscated) {
    return (
      <span className={className}>
        <ObfuscatedText text={section.text} />
      </span>
    );
  }

  return <span className={className}>{section.text}</span>;
}

export interface MinecraftTextProps {
  text: string;
  className?: string;
}

export function MinecraftText({ text, className }: MinecraftTextProps) {
  const sections = parseMinecraftText(text);

  return (
    <span className={cn("font-minecraft", className)}>
      {sections.map((section, index) => (
        <MinecraftTextPart key={index} section={section} />
      ))}
    </span>
  );
} 