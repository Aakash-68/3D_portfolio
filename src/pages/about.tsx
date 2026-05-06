import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import RotatingText from "../components/Effects/RotatingText";
import CurvedLoop from "../components/Effects/Ribbon";
import { useNavigate } from "react-router-dom";
import Magnet from "../components/Effects/Magnet";

interface AboutProps {
  onClose: () => void;
}

const roles = ["Software engineer", "Web developer", "3D artist"];

const AboutPage: React.FC<AboutProps> = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      className="relative top-10 bottom-32 left-12 w-[600px] h-[650px] 
             bg-white/40 backdrop-blur-2xl rounded-3xl p-12 
             shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] 
             border border-white/20 z-30 flex flex-col overflow-hidden"
    >
      <div className="relative z-10 flex flex-col h-full">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4 text-[#1A1A1A]" />
        </button>
        <div className="mb-10">
          <span className="text-[9px] uppercase tracking-[0.4em] text-[#A0A0A0] mb-4 block font-bold">
            About ME
          </span>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <h2 className="text-5xl font-light tracking-tight text-[#1A1A1A]">
                Hello! I'm
              </h2>

              <h2 className="italic font-serif text-6xl text-[#1A1A1A]/40">
                Aakash
              </h2>
            </div>

            <div className="flex items-center gap-2 text-lg font-light text-[#A0A0A0] relative overflow-hidden">
              <div className="w-12 h-1 bg-[#1A1A1A] mt-1" />
              <RotatingText
                texts={["Software Engineer", "Web-Devloper", "3D-Artist"]}
                mainClassName="text-black overflow-hidden justify-center rounded-lg"
                staggerFrom="first"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={4000}
                splitBy="characters"
                elementLevelClassName="italic"
                auto
                loop
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-4 ">
          <p className="text-[#444] text-lg leading-relaxed font-light font-sans">
            Currently based in digital realms, I specialize in crafting digital
            products that balance{" "}
            <span className="italic font-serif text-[#1A1A1A]">technical</span>{" "}
            precision with human warmth. I believe the best solutions are found
            in simplicity.
          </p>
          <Magnet padding={30} disabled={false} magnetStrength={35}>
            <button
              className="
      mt-7 px-8 py-3 text-sm font-medium tracking-wide
      text-[#1A1A1A]
      rounded-full
      bg-white/30 backdrop-blur-xl
      border border-white/30
      shadow-[0_4px_20px_rgba(0,0,0,0.05)]
      transition-all duration-300 ease-out

      hover:italic
      hover:bg-white/40
      hover:scale-105

      active:scale-95
    "
              onClick={() => navigate("/contact")}
            >
              Contact Me
            </button>
          </Magnet>
        </div>
        <footer className="mt-auto pt-4 border-t border-black/5 w-full">
          <CurvedLoop
            marqueeText="SQL ✦ Blender ✦ Davinci ✦ React ✦ Java ✦ Python ✦ HTML/CSS ✦ Java ✦"
            speed={2}
            curveAmount={50}
            direction="right"
            interactive
            className="custom-text-style"
          />
        </footer>
      </div>
    </motion.div>
  );
};

export default AboutPage;
