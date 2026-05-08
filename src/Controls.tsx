import type { TimerStatus } from "./useTimer";
import { ActionButton } from "./components/actionButton";

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
        <ActionButton
          text="Pause"
          onClick={onPause}
          className="px-6 bg-[#009eff] hover:bg-blue-600 text-white"
        />
      ) : status === "paused" ? (
        <ActionButton
          text="Resume"
          onClick={onResume}
          className="bg-[#009eff] hover:bg-blue-600 text-white"
        />
      ) : (
        <ActionButton
          text="Start"
          onClick={onStart}
          className="bg-[#009eff] hover:bg-blue-600 text-white"
        />
      )}

      <ActionButton
        text="Reset"
        onClick={onReset}
        className="bg-[#a436ff] hover:bg-[#7e14d5] border border-border text-foreground"
      />

      <ActionButton
        text="Clear"
        onClick={handleClear}
        className="bg-[#ec00ff] hover:bg-[#a804b5] border border-border text-foreground"
      />
    </div>
  );
};

export default Controls;
