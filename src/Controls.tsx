import type { TimerStatus } from "./useTimer";

const Controls = ({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onClear,
}: {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onClear: () => void;
}) => {
  const handleClear = () => {
    onClear();
  };

  return (
    <div className="flex flex-col gap-2">
      {status === "active" || status === "complete" ? (
        <button
          onClick={onPause}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
        >
          Pause
        </button>
      ) : status === "paused" ? (
        <button
          onClick={onResume}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
        >
          Resume
        </button>
      ) : (
        <button
          onClick={onStart}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
        >
          Start meeting
        </button>
      )}
      <button
        onClick={onReset}
        className="px-8 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted/50 transition-colors"
      >
        Reset
      </button>
      <button
        onClick={handleClear}
        className="px-8 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted/50 transition-colors"
      >
        Clear
      </button>
    </div>
  );
};

export default Controls;
