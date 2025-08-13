import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
const ButtonDemo = () => {
  return (
    <>
      {" "}
      <Button variant="ghost" className="hover:bg-sky-100">
        Ghost
      </Button>
      <Button
        variant="outline"
        className="bg-sky-100 border-none hover:bg-sky-300"
      >
        Outline
      </Button>
      <Button variant="destructive">Destructive</Button>
      <Button size="sm" disabled>
        <Loader2Icon className="animate-spin" />
        Please wait
      </Button>
    </>
  );
};
export default ButtonDemo;
