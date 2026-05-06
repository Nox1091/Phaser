import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import "./App.css";
import { usePhazer, type Timer } from "./context/phazerProvider";
import useEvent from "./useEvent";
import type { TimerStatus } from "./useTimer";
import { Input } from "./components/ui/input";
import Logo from "./assets/logo.svg?react";

function Phazer() {
  const { timer, phases, activePhaseId, shouldContinue, dispatch } =
    usePhazer();
  const {
    status,
    start: startTimer,
    clear: clearTimer,
    pause,
    resume,
    reset,
  } = timer;
  const currentActivePhase =
    activePhaseId !== null
      ? phases.find((phase) => phase.id === activePhaseId)
      : null;

  const allPhasesComplete = phases.every(
    (phase) => phase.status === "complete",
  );

  useEvent("start_timer", ({ startTime }: { startTime: number }) => {
    dispatch({ type: "START_MEETING", phaseId: activePhaseId ?? 0, startTime });
  });

  useEvent("pause_timer", ({ elapsedTime }: { elapsedTime: number }) => {
    dispatch({
      type: "PAUSE_CURRENT",
      phaseId: activePhaseId ?? 0,
      elapsedTime,
    });
  });

  useEvent("resume_timer", ({ startTime }: { startTime: number }) => {
    dispatch({
      type: "RESUME_CURRENT",
      phaseId: activePhaseId ?? 0,
      startTime,
    });
  });

  useEvent(
    "end_timer",
    ({ endTime, elapsedTime }: { endTime: number; elapsedTime: number }) => {
      dispatch({
        type: "COMPLETE_CURRENT",
        phaseId: activePhaseId ?? 0,
        endTime,
        elapsedTime,
      });
    },
  );

  useEvent("reset_timer", () => {
    dispatch({
      type: "RESET_CURRENT",
      phaseId: activePhaseId ?? 0,
    });
  });

  // when timer completes, complete the current phase and move to next
  useEffect(() => {
    if (!activePhaseId) return;

    if (status === "complete" && shouldContinue) {
      const nextPhase = phases.find((p) => p.id === activePhaseId);
      timer.start((nextPhase?.durationMins || 0) * 60 * 1000 || 0);
    }
  }, [status, activePhaseId]);

  if (allPhasesComplete) return <div>All phases complete!</div>;

  const totalDuration = phases.reduce((sum, p) => sum + p.durationMins, 0);

  const handleClear = () => {
    clearTimer();
    dispatch({ type: "CLEAR_ALL" });
  };

  const deletePhase = (id: number) => {
    const deletedPhase = phases.find((phase) => phase.id === id);
    dispatch({ type: "DELETE_PHASE", phaseId: id });
    if (deletedPhase?.status === "active") {
      clearTimer();
    }
  };

  const addPhase = () => {
    const newId = Math.max(...phases.map((p) => p.id), 0) + 1;
    dispatch({
      type: "ADD_PHASE",
      phase: {
        id: newId,
        name: `Phase ${newId}`,
        durationMins: 5,
        status: "not started",
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Title text="phaZer" />
      <div className="max-w-2xl mx-auto" style={{ fontStyle: "italic" }}>
        <Timer
          timerState={timer}
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
        <div className="mb-6 text-sm text-muted-foreground">
          <span>{phases.length} phases</span>
          <span className="mx-2">·</span>
          <span>total {totalDuration} min</span>
        </div>
        <div className="space-y-3 mb-8">
          {phases.map((phase, index) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              index={index}
              timerState={timer}
              onDelete={deletePhase}
            />
          ))}
        </div>

        <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
          <button
            onClick={addPhase}
            className="text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            + Add phase
          </button>
        </div>
      </div>
    </div>
  );
}

const Timer = ({
  timerState,
  onStart,
  onPause,
  onResume,
  onReset,
  onClear,
}: {
  timerState: Timer;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onClear: () => void;
}) => {
  const { status, timeRemainingMs } = timerState;

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
            timerStatus={status}
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

const Controls = ({
  timerStatus,
  onStart,
  onPause,
  onResume,
  onReset,
  onClear,
}: {
  timerStatus: TimerStatus;
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
      {timerStatus === "active" || timerStatus === "complete" ? (
        <button
          onClick={onPause}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
        >
          Pause
        </button>
      ) : timerStatus === "paused" ? (
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

const PhaseCard = ({
  phase,
  index,
  timerState,
  onDelete,
}: {
  phase: { id: number; name: string; durationMins: number; status: string };
  index: number;
  timerState: Timer;
  onDelete: (id: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("New Phase");
  const { dispatch } = usePhazer();

  const formatStatusDisplay = (status: string) => {
    if (status === "not started") return "Not Started";
    if (status === "complete") return "Complete";
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  const toggleEdit = (event: Event) => {
    event.stopPropagation();
    setIsEditing(!isEditing);
  };

  const handleInput = (event: Event) => {
    setName(event.target.value);

    // TODO: We'll optimize this so we're not updating
    dispatch({
      type: "UPDATE_PHASE",
      phaseId: phase.id,
      name: event.target.value,
    });
  };

  return (
    <Card
      key={phase.id}
      className={`bg-card border hover:border-opacity-80 transition-colors group h-10 p-0 ${getStatusBorderColor(phase.status)}`}
    >
      <CardContent className="p-1 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-muted-foreground font-medium text-lg w-6 text-center">
            {index + 1}
          </span>
          <span className="text-foreground font-medium">
            {isEditing ? (
              <Input
                autoFocus
                onFocus={() => setIsEditing(true)}
                onBlur={() => setIsEditing(false)}
                className="border-none dark:bg-transparent focus-visible:ring-0"
                placeholder={name}
                onChange={handleInput}
              />
            ) : (
              <span onClick={toggleEdit}>{name}</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-semibold">{phase.durationMins}</span>
            <span className="text-xs">min</span>
          </div>
          <Badge
            variant="default"
            className={`rounded-full p-1 w-20 flex justify-center ${getStatusColor(phase.status)}`}
          >
            {formatStatusDisplay(phase.status)}
          </Badge>
          <button
            onClick={() => onDelete(phase.id)}
            className={`p-2 text-muted-foreground hover:text-foreground hover:bg-transparent rounded-md transition-colors opacity-0 group-hover:opacity-100 ${timerState.status === "active" ? "invisible" : ""}`}
          >
            <X size={18} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const getStatusBorderColor = (status: string) => {
  switch (status) {
    case "complete":
      return "border-purple-500/60";
    case "active":
      return "border-active";
    case "paused":
      return "border-yellow-500/60";
    case "not started":
      return "border-gray-500/60";
    default:
      return "border-border";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "complete":
      return "bg-purple-500/80 text-white";
    case "active":
      return "bg-active text-white";
    case "paused":
      return "bg-yellow-500/80 text-white";
    case "not started":
      return "bg-gray-500/80 text-white";
    default:
      return "bg-gray-500/80 text-white";
  }
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
