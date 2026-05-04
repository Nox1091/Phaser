import { useCallback, useRef, useState } from "react";
import eventBus from "./eventBus";

export type TimerStatus = "active" | "paused" | "complete" | "stopped";

export const useTimer = () => {
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>("stopped");
  const durationRef = useRef(0);
  const timeRef = useRef({
    startTime: 0,
    pausedTime: 0,
  });
  const intervalRef = useRef<number | null>(null);

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const set = useCallback(
    (timeMs: number) => {
      clearIntervalRef();
      durationRef.current = timeMs;
      timeRef.current.startTime = 0;
      timeRef.current.pausedTime = 0;
      setTimeRemainingMs(timeMs);
      setStatus("stopped");
    },
    [clearIntervalRef],
  );

  const start = useCallback(
    (durationMs: number) => {
      clearIntervalRef();
      durationRef.current = durationMs;
      timeRef.current.startTime = Date.now();
      timeRef.current.pausedTime = 0;

      setStatus("active");
      eventBus.emit("start_timer", { startTime: timeRef.current.startTime });

      setTimeRemainingMs(durationMs);

      intervalRef.current = window.setInterval(() => {
        const elapsed =
          Date.now() - timeRef.current.startTime + timeRef.current.pausedTime;
        const remaining = durationRef.current - elapsed;
        const clamped = Math.max(remaining, 0);

        setTimeRemainingMs(clamped);

        if (clamped === 0) {
          clearIntervalRef();
          setStatus("complete");
          eventBus.emit("end_timer", {
            endTime: Date.now(),
            elapsedTime: elapsed,
          });
        }
      }, 100);
    },
    [clearIntervalRef],
  );

  const pause = useCallback(() => {
    if (status !== "active") return;
    clearIntervalRef();
    timeRef.current.pausedTime += Date.now() - timeRef.current.startTime;
    eventBus.emit("pause_timer", { elapsed: timeRef.current.pausedTime });
    setStatus("paused");
  }, [clearIntervalRef, status]);

  const resume = useCallback(() => {
    if (status !== "paused") return;

    timeRef.current.startTime = Date.now();
    setStatus("active");
    eventBus.emit("resume_timer", { startTime: timeRef.current.startTime });

    intervalRef.current = setInterval(() => {
      const elapsed =
        Date.now() - timeRef.current.startTime + timeRef.current.pausedTime;
      const remaining = durationRef.current - elapsed;
      const clamped = Math.max(remaining, 0);

      setTimeRemainingMs(clamped);

      if (clamped === 0) {
        clearIntervalRef();
        setStatus("complete");
        eventBus.emit("end_timer", {
          endTime: Date.now(),
          elapsedTime: elapsed,
        });
      }
    }, 100);
  }, [clearIntervalRef, status]);

  const reset = useCallback(() => {
    clearIntervalRef();
    timeRef.current.startTime = 0;
    timeRef.current.pausedTime = 0;
    setTimeRemainingMs(durationRef.current);
    setStatus("stopped");
    eventBus.emit("reset_timer", {});
  }, [clearIntervalRef]);

  const clear = useCallback(() => {
    clearIntervalRef();
    durationRef.current = 0;
    timeRef.current.startTime = 0;
    timeRef.current.pausedTime = 0;
    setTimeRemainingMs(0);
    setStatus("stopped");
    eventBus.emit("clear_timer", {});
  }, [clearIntervalRef]);

  return {
    set,
    start,
    pause,
    resume,
    reset,
    clear,
    subscribe: eventBus.subscribe,
    timeRemainingMs,
    status,
  };
};

export default useTimer;
