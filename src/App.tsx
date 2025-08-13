//import ButtonDemo from "./components/Demo/ButtonDemo";
//import { SonnerDemo } from "./components/Demo/SonnerDemo";
// import { CarouselDemo } from "./components/Demo/CarouselDemo";
// import { TooltipDemo } from "./components/Demo/TooltipDemo";
import { AccordionDemo } from "./components/Demo/AccordionDemo";
function App() {
  return (
    <div className=" min-h-screen w-full flex justify-center items-center bg-amber-100 ">
      {" "}
      <div className="min-h-[80vh] w-1/3 ">
        <AccordionDemo />
      </div>
    </div>
  );
}

export default App;
