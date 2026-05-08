import { useEffect } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import "./App.css";
import {
  PhazerProvider,
  usePhazer,
  type Timer,
} from "./context/phazerProvider";
import { useTimer, type TimerStatus } from "./useTimer";
import Logo from "./assets/logo.svg?react";
import Controls from "./Controls";
import PhaseManager from "./PhaseManager";

function Phazer() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Title text="phaZer" />
      <PhazerProvider>
        <Content />
      </PhazerProvider>
    </div>
  );
}

const Content = () => {
  const {
    phases,
    activePhaseId,
    shouldContinue,
    currentActivePhase,
    dispatch,
  } = usePhazer();
  const {
    status,
    timeRemainingMs,
    start: startTimer,
    clear: clearTimer,
    pause,
    resume,
    reset,
  } = useTimer();

  const allPhasesComplete = phases.every(
    (phase) => phase.status === "complete",
  );

  // when timer completes, complete the current phase and move to next
  useEffect(() => {
    if (!activePhaseId) return;

    if (status === "complete" && shouldContinue) {
      const nextPhase = phases.find((p) => p.id === activePhaseId);
      startTimer((nextPhase?.durationMins || 0) * 60 * 1000 || 0);
    }
  }, [status, activePhaseId]);

  if (allPhasesComplete) return <div>All phases complete!</div>;

  const handleClear = () => {
    clearTimer();
    dispatch({ type: "CLEAR_ALL" });
  };

  return (
    <div className="max-w-2xl mx-auto" style={{ fontStyle: "italic" }}>
      <Timer
        status={status}
        timeRemainingMs={timeRemainingMs}
        onStart={() => {
          if (!currentActivePhase)
            startTimer(phases[0]?.durationMins * 60 * 1000);
          else startTimer(currentActivePhase.durationMins * 60 * 1000);
        }}
        onPause={() => {
          pause();
        }}
        onResume={() => {
          resume();
        }}
        onReset={() => {
          reset();
        }}
        onClear={handleClear}
      />
      <PhaseManager clearTimer={clearTimer} timerStatus={status} />
    </div>
  );
};

const Timer = ({
  status,
  timeRemainingMs,
  onStart,
  onPause,
  onResume,
  onReset,
  onClear,
}: {
  status: TimerStatus;
  timeRemainingMs: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onClear: () => void;
}) => {
  return (
    <Card className="mb-8 bg-card border border-border">
      <CardHeader className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-7xl font-black tracking-tighter text-foreground ">
              {formatTime(timeRemainingMs)}
            </div>
          </div>
          <Controls
            status={status}
            onStart={onStart}
            onPause={onPause}
            onResume={onResume}
            onReset={onReset}
            onClear={onClear}
          />
        </div>
      </CardHeader>
    </Card>
  );
};

const Title = ({ text }: { text: string }) => (
  <div className="mb-4 text-center">
    <span className="inline-block text-8xl font-black tracking-widest">
      <span className="flex flex-row items-center ">
        <Logo className="mr-10" width={100} height={100} />
        <p
          style={{
            background:
              "linear-gradient(135deg, #00d4ff 0%, #0099ff 25%, #ff00ff 50%, #ff0080 75%, #00d4ff 100%)",
            backgroundSize: "185% 185%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-5px",
            transform: "skewX(-20deg) perspective(1000px) rotateY(-5deg)",
          }}
        >
          {text}
        </p>
      </span>
    </span>
  </div>
);

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default Phazer;
