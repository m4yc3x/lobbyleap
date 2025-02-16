import { TitleBar } from "@/components/TitleBar";
import { MainContent } from "@/components/main/MainContent";

function App() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <TitleBar />
      <div className="flex-1 overflow-y-auto">
        <MainContent />
      </div>
    </div>
  );
}

export default App;
