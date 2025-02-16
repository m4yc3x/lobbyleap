import { TitleBar } from "@/components/TitleBar";
import { MainContent } from "@/components/main/MainContent";

function App() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <TitleBar />
      <MainContent />
    </div>
  );
}

export default App;
