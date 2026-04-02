import React from "react";
import { useProgress } from "@react-three/drei";
import { Slab } from "react-loading-indicators";
import Loader from "./Loader";

interface LoadingScreenProps {
  started: boolean;
  onStarted: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  started,
  onStarted,
}) => {
  const { progress } = useProgress();
  const isLoaded = progress >= 100;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Loader 
        <Slab color="#000000" size="large" text="" textColor="" />*/}
        <Loader />
        {/* Title */}
        <h1 className="text-2xl text-black font-semibold">Loading...</h1>

        {/* Progress */}
        <p className="text-black text-sm">{Math.round(progress)}%</p>

        {/* Button */}
        <button
          onClick={onStarted}
          disabled={!isLoaded}
          className={`px-6 py-3 rounded-lg border border-black transition-all duration-200
            ${
              isLoaded
                ? "bg-black text-white opacity-100 cursor-pointer hover:opacity-80"
                : "bg-black text-white opacity-50 cursor-not-allowed"
            }`}
        >
          {isLoaded ? "Start" : "Loading..."}
        </button>
      </div>
    </div>
  );
};
