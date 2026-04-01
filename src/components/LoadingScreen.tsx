import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

interface Props {
  started: boolean;
  onStarted: () => void;
}

export const LoadingScreen = ({ started, onStarted }: Props) => {
  const { progress, active } = useProgress();

  const [ready, setReady] = useState(false);

  // when loading finished
  useEffect(() => {
    if (progress === 100 && !active) {
      setReady(true);
    }
  }, [progress, active]);

  return (
    <div className={`loadingScreen ${started ? "loadingScreen--started" : ""}`}>
      {/* progress bar */}
      <div className="loadingScreen__progress">
        <div
          className="loadingScreen__progress__value"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {/* text / animation */}
      <div className="loadingScreen__board">
        {!ready && (
          <h1 className="loadingScreen__title">
            Loading {Math.floor(progress)}%
          </h1>
        )}

        {ready && <h1 className="loadingScreen__title">100% Ready</h1>}

        <button
          className="loadingScreen__button"
          disabled={!ready}
          onClick={onStarted}
        >
          Start
        </button>
      </div>
    </div>
  );
};
