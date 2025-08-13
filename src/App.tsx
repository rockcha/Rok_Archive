//import ButtonDemo from "./components/Demo/ButtonDemo";
//import { SonnerDemo } from "./components/Demo/SonnerDemo";
// import { CarouselDemo } from "./components/Demo/CarouselDemo";
// import { TooltipDemo } from "./components/Demo/TooltipDemo";
import { AnimatedThemeToggler } from "./components/ui/magicui/animated-theme-toggler";
//import { IconCloud } from "./components/magicui/icon-cloud";
import { Highlighter } from "./components/ui/magicui/highlighter";
import { TypingAnimation } from "@/components/ui/magicui/typing-animation";
import { InteractiveHoverButton } from "./components/ui/magicui/interactive-hover-button";
import { Dock, DockIcon } from "@/components/ui/magicui/dock";
import { Home, Settings, Search } from "lucide-react";
function App() {
  return (
    <div className=" min-h-screen w-full flex justify-center items-center  ">
      <p>
        <AnimatedThemeToggler />
        The{" "}
        <Highlighter action="underline" color="#FF9800">
          Magic UI Highlighter
        </Highlighter>{" "}
        makes important{" "}
        <Highlighter action="highlight" color="#87CEFA">
          text stand out
        </Highlighter>{" "}
        effortlessly.
      </p>
      <TypingAnimation duration={80}>Typing Animation</TypingAnimation>
      <InteractiveHoverButton className="bg-blue-200">
        Button
      </InteractiveHoverButton>
      <Dock>
        <DockIcon>
          <Home />
          <Settings />
          <Search />
        </DockIcon>
      </Dock>
    </div>
  );
}

export default App;
