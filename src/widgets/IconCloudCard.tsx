import { IconCloud } from "@/shared/magicui/icon-cloud";

const slugs = [
  "typescript",
  "javascript",
  "dart",

  "react",
  "flutter",
  "android",
  "html5",

  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",

  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "cypress",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",

  "androidstudio",

  "figma",
];

export function IconCloudCard() {
  const images = slugs.map((slug) => `https://cdn.simpleicons.org/${slug}`);

  return (
    <div className="relative flex size-full items-center justify-center  ">
      <IconCloud images={images} />
    </div>
  );
}
