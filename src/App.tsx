import { useState } from "react";
import { useTimer } from "./useTimer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import "./App.css";

const phaseData = [
  {
    id: 1,
    name: "Background",
    durationMins: 0.1,
    status: "not started",
  },
  {
    id: 2,
    name: "Vector Embedding Storage",
    durationMins: 0.2,
    status: "not started",
  },
  {
    id: 3,
    name: "Search Algorithms",
    durationMins: 10,
    status: "not started",
  },
  {
    id: 4,
    name: "Q&A",
    durationMins: 5,
    status: "not started",
  },
];

function App() {
  const [phases, setPhases] = useState(phaseData);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const currentPhase = phases[phaseIndex];
  const durationMs = (currentPhase?.durationMins || 0) * 60 * 1000;
  const { start, pause, resume, reset, remainingTimeMs, timerState } = useTimer(
    durationMs,
    {
      onStart: () => {},
      onComplete: () => {
        // when timer completes, advance to next phase
        if (phaseIndex < phases.length - 1) {
          setPhaseIndex(phaseIndex + 1);
          setPhases((prev) => {
            const newPhases = [...prev];
            newPhases[phaseIndex] = {
              ...newPhases[phaseIndex],
              status: "completed",
            };
            if (phaseIndex + 1 < newPhases.length) {
              newPhases[phaseIndex + 1] = {
                ...newPhases[phaseIndex + 1],
                status: "running",
              };
            }
            return newPhases;
          });
        }
      },
    },
  );

  const totalDuration = phases.reduce((sum, p) => sum + p.durationMins, 0);
  const getStatusLabel = () => {
    if (timerState === "running") return "RUNNING";
    if (timerState === "paused") return "PAUSED";
    return "READY";
  };

  const deletePhase = (id: number) => {
    setPhases(phases.filter((p) => p.id !== id));
  };

  const addPhase = () => {
    const newId = Math.max(...phases.map((p) => p.id), 0) + 1;
    setPhases([
      ...phases,
      {
        id: newId,
        name: `Phase ${newId}`,
        durationMins: 5,
        status: "not started",
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="mb-12 text-center">
        <span
          className="inline-block text-8xl font-black tracking-widest"
          style={{
            background:
              "linear-gradient(135deg, #00d4ff 0%, #0099ff 25%, #ff00ff 50%, #ff0080 75%, #00d4ff 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontStyle: "italic",
            transform: "skewX(-20deg) perspective(1000px) rotateY(-5deg)",
            fontFamily: "'Arial Black', sans-serif",
            letterSpacing: "-5px",
          }}
        >
          PHASER
        </span>
      </div>
      <div className="max-w-2xl mx-auto" style={{ fontStyle: "italic" }}>
        <Card className="mb-8 bg-card border border-border">
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-4">
                  {getStatusLabel()}
                </p>
                <div className="text-7xl font-black tracking-tighter text-foreground font-mono">
                  {formatTime(remainingTimeMs)}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {timerState === "running" ? (
                  <button
                    onClick={pause}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    Pause
                  </button>
                ) : timerState === "paused" ? (
                  <button
                    onClick={resume}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={start}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    Start meeting
                  </button>
                )}
                <button
                  onClick={reset}
                  className="px-8 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted/50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

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
              phaseIndex={phaseIndex}
              timerState={timerState}
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

const PhaseCard = ({
  phase,
  index,
  phaseIndex,
  timerState,
  onDelete,
}: {
  phase: { id: number; name: string; durationMins: number; status: string };
  index: number;
  phaseIndex: number;
  timerState: string;
  onDelete: (id: number) => void;
}) => {
  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-purple-500/60";
      case "running":
        return "border-blue-500/60";
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
      case "completed":
        return "bg-purple-500/80 text-white";
      case "running":
        return "bg-blue-500/80 text-white";
      case "paused":
        return "bg-yellow-500/80 text-white";
      case "not started":
        return "bg-gray-500/80 text-white";
      default:
        return "bg-gray-500/80 text-white";
    }
  };

  const formatStatusDisplay = (status: string) => {
    if (status === "not started") return "Not Started";
    if (status === "completed") return "Completed";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPhaseStatus = (idx: number) => {
    if (idx < phaseIndex) return "completed";
    if (idx === phaseIndex) {
      if (timerState === "running") return "running";
      if (timerState === "paused") return "paused";
      return "not started";
    }
    return "not started";
  };

  const currentStatus = getPhaseStatus(index);
  return (
    <Card
      key={phase.id}
      className={`bg-card border hover:border-opacity-80 transition-colors group h-10 p-0 ${getStatusBorderColor(currentStatus)}`}
    >
      <CardContent className="p-1 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <span className="text-muted-foreground font-medium text-lg w-6 text-center">
            {index + 1}
          </span>
          <span className="text-foreground font-medium">{phase.name}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-semibold">{phase.durationMins}</span>
            <span className="text-xs">min</span>
          </div>
          <Badge
            variant="default"
            className={`rounded-full p-1 w-20 flex justify-center ${getStatusColor(currentStatus)}`}
          >
            {formatStatusDisplay(currentStatus)}
          </Badge>
          <button
            onClick={() => onDelete(phase.id)}
            className={`p-2 text-muted-foreground hover:text-foreground hover:bg-transparent rounded-md transition-colors opacity-0 group-hover:opacity-100 ${timerState === "running" ? "invisible" : ""}`}
          >
            <X size={18} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default App;
