import { useRef, useState } from "react";

export const useTimer = (durationMs: number = 0) => {
  const [remainingTimeMs, setRemainingTimeMs] = useState(durationMs);
  const [timerState, setTimerState] = useState<
    "stopped" | "running" | "paused"
  >("stopped");
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);
  const intervalRef = useRef(0);

  const start = () => {
    startTimeRef.current = Date.now();
    setTimerState("running");

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = durationMs - elapsed - pausedTimeRef.current;
      setRemainingTimeMs(Math.max(remaining, 0));
    }, 100);
  };

  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pausedTimeRef.current += Date.now() - startTimeRef.current;
    setTimerState("paused");
  };

  const resume = () => {
    startTimeRef.current = Date.now();
    setTimerState("running");

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = durationMs - elapsed - pausedTimeRef.current;
      setRemainingTimeMs(Math.max(remaining, 0));
    }, 100);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    setRemainingTimeMs(durationMs);
    setTimerState("stopped");
  };

  return {
    start,
    pause,
    resume,
    reset,
    remainingTimeMs,
    timerState,
  };
};

export default useTimer;
