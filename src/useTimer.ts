import { useCallback, useRef, useState } from "react";
import type { TimerStatus } from "./context/phazerProvider";

export const useTimer = () => {
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(0);
  const [status, setStatus] = useState<TimerStatus>("stopped");
  const durationRef = useRef(0);
  const timeRef = useRef({
    startTime: 0,
    pausedTime: 0,
  });
  const intervalRef = useRef<number | null>(null);

  // TODO: move this outside of hook logic
  const subscribersRef = useRef<Map<string, ((payload: unknown) => void)[]>>(
    new Map(),
  );

  // TODO: move this outside of hook logic
  const emit = useCallback((event, payload) => {
    subscribersRef.current.get(event)?.forEach((fn) => fn(payload));
  }, []);

  const subscribe = useCallback((event, fn) => {
    if (!subscribersRef.current.has(event))
      subscribersRef.current.set(event, []);
    subscribersRef.current.get(event).push(fn);
    return () => {
      // unsubscribe
      const fns = subscribersRef.current.get(event) ?? [];
      subscribersRef.current.set(
        event,
        fns.filter((f) => f !== fn),
      );
    };
  }, []);

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
      emit("active", { startTime: timeRef.current.startTime });

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
          emit("complete", {});
        }
      }, 100);
    },
    [clearIntervalRef],
  );

  const pause = useCallback(() => {
    if (status !== "active") return;
    clearIntervalRef();
    timeRef.current.pausedTime += Date.now() - timeRef.current.startTime;
    emit("pause", { elapsed: timeRef.current.pausedTime });
    setStatus("paused");
  }, [clearIntervalRef, status]);

  const resume = useCallback(() => {
    if (status !== "paused") return;

    timeRef.current.startTime = Date.now();
    setStatus("active");
    emit("resume", { startTime: timeRef.current.startTime });

    intervalRef.current = setInterval(() => {
      const elapsed =
        Date.now() - timeRef.current.startTime + timeRef.current.pausedTime;
      const remaining = durationRef.current - elapsed;
      const clamped = Math.max(remaining, 0);

      setTimeRemainingMs(clamped);

      if (clamped === 0) {
        clearIntervalRef();
        setStatus("complete");
        emit("complete", {});
      }
    }, 100);
  }, [clearIntervalRef, status]);

  const reset = useCallback(() => {
    clearIntervalRef();
    timeRef.current.startTime = 0;
    timeRef.current.pausedTime = 0;
    setTimeRemainingMs(durationRef.current);
    setStatus("stopped");
    emit("reset", {});
  }, [clearIntervalRef]);

  const clear = useCallback(() => {
    clearIntervalRef();
    durationRef.current = 0;
    timeRef.current.startTime = 0;
    timeRef.current.pausedTime = 0;
    setTimeRemainingMs(0);
    setStatus("stopped");
    emit("clear", {});
  }, [clearIntervalRef]);

  return {
    set,
    start,
    pause,
    resume,
    reset,
    clear,
    subscribe,
    timeRemainingMs,
    status,
  };
};

export default useTimer;
