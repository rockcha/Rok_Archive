import { IconCloud } from "@/shared/magicui/icon-cloud";
import {
  Github,
  Cpu,
  Database,
  Cloud,
  Terminal,
  Code,
  Server,
  Globe,
} from "lucide-react";

export default function TechCloud() {
  return (
    <IconCloud
      icons={[
        <Github key="gh" size={100} />,
        <Cpu key="cpu" size={100} />,
        <Database key="db" size={100} />,
        <Cloud key="cloud" size={100} />,
        <Terminal key="terminal" size={100} />,
        <Code key="code" size={100} />,
        <Server key="server" size={100} />,
        <Globe key="globe" size={100} />,
      ]}
    />
  );
}
