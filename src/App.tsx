import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TitleBar } from "@/components/TitleBar";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <TitleBar />
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
          Welcome to Tauri+React+ShadCN+TailwindCSS
        </div>
        <Card className="container flex flex-col items-center gap-8">
          <CardContent className="flex flex-col items-center gap-8 p-8">
            <form
              className="flex w-full max-w-sm flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                greet();
              }}
            >
              <div className="flex gap-2">
                <Input
                  id="greet-input"
                  onChange={(e) => setName(e.currentTarget.value)}
                  placeholder="Enter a name..."
                />
                <Button type="submit">
                  Greet
                </Button>
              </div>
              {greetMsg && (
                <Label className="text-muted-foreground">{greetMsg}</Label>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default App;
