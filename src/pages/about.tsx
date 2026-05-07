import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import RotatingText from "../components/Effects/RotatingText";
import CurvedLoop from "../components/Effects/Ribbon";
import { useNavigate } from "react-router-dom";
import Magnet from "../components/Effects/Magnet";
import { FloatingDock } from "../components/Effects/FloatingDock";
import { FloatingDockDemo } from "../components/Effects/FlocatingDockComp";

interface AboutProps {
  onClose: () => void;
}

const roles = ["Software engineer", "Web developer", "3D artist"];

const AboutPage: React.FC<AboutProps> = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col mt-10 lg:flex-row items-start justify-center gap-6 lg:gap-10 w-full px-6">
        <motion.div
          className=" w-full  max-w-[600px] min-h-[650px] 
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
                  <h2 className="text-[28px] sm:text-4xl font-light tracking-tight text-[#1A1A1A]">
                    Hello! I'm
                  </h2>
                  <h2 className="italic font-serif text-[50px] sm:text-5xl text-[#1A1A1A]/40">
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
                I’m a{" "}
                <span className="italic font-serif text-[#1A1A1A]">
                  Software Engineering
                </span>{" "}
                student at the University of New Brunswick with a strong
                interest in
                <span className=" font-serif text-[#1A1A1A]"> 3D art,</span> UI
                design, and machine learning. I enjoy blending creativity with
                technical problem-solving, exploring visual design systems, and
                building data-driven solutions through ML.
              </p>
              <button
                className="
                            mt-7 px-10 py-3 text-sm font-medium tracking-wide
                            text-[#1A1A1A]
                            rounded-full
                            bg-gray-200 backdrop-blur-xl
                            border border-white/30                         
                          transition-all duration-300 ease-out

                            hover:italic
                            hover:bg-gray-100
                            hover:scale-102

                            active:scale-95
                          "
                onClick={() => navigate("/contact")}
              >
                Contact Me
              </button>
            </div>

            <footer className="fixed bottom-0 left-0 w-full pt-4 border-t border-black/5 bg-white/40 backdrop-blur-xl z-50">
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
        <div className="hidden lg:flex flex-col items-center justify-start gap-2 w-full max-w-[600px] min-h-[650px]">
          <img
            src="/3D_portfolio/assets/profile.svg"
            alt="Portfolio Profile"
            className="w-[360px] object-contain"
          />
          <div className="mt-2">
            <FloatingDockDemo />
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
