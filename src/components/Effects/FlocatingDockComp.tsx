import React from "react";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconExchange,
  IconFile,
  IconFileCv,
  IconHome,
  IconMail,
  IconNewSection,
  IconPlaneArrivalFilled,
  IconPlaneDeparture,
  IconPlaneTilt,
  IconTerminal2,
} from "@tabler/icons-react";
import { FloatingDock } from "./FloatingDock";

export function FloatingDockDemo() {
  const links = [
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/Aakash-68",
    },
    {
      title: "LinkedIn",
      icon: (
        <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.linkedin.com/in/aakash-yogabalu-0a85652a8/",
    },
    {
      title: "Resume",
      icon: (
        <IconFileCv className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://drive.google.com/uc?export=download&id=16KnxyIdTcmNvti3dfnE6Rx2NERtx_qAO",
    },
  ];
  return (
    <div className="flex items-center justify-center  w-full">
      <FloatingDock
        mobileClassName="translate-y-20" // only for demo, remove for production
        items={links}
      />
    </div>
  );
}
