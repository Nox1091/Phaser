import { useState } from "react";
import { useTimer } from "./useTimer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import "./App.css";

function App() {
  const [phases, setPhases] = useState([
    {
      id: 1,
      name: "Intro & alignment",
      durationMins: 5,
      status: "not started",
    },
    { id: 2, name: "Main discussion", durationMins: 20, status: "in progress" },
    { id: 3, name: "Q&A", durationMins: 10, status: "not started" },
    {
      id: 4,
      name: "Next steps & wrap-up",
      durationMins: 5,
      status: "not started",
    },
  ]);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const currentPhase = phases[phaseIndex];
  const durationMs = (currentPhase?.durationMins || 0) * 60 * 1000;
  const { start, pause, resume, reset, remainingTimeMs, timerState } =
    useTimer(durationMs);

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
      <div className="max-w-2xl mx-auto">
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
            <Card
              key={phase.id}
              className="bg-card border border-border hover:border-border/80 transition-colors group h-10 p-0"
            >
              <CardContent className="p-1 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-muted-foreground font-medium text-lg w-6 text-center">
                    {index + 1}
                  </span>
                  <span className="text-foreground font-medium">
                    {phase.name}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-semibold">{phase.durationMins}</span>
                    <span className="text-xs">min</span>
                  </div>
                  <button
                    onClick={() => deletePhase(phase.id)}
                    className={`p-2 text-muted-foreground hover:text-foreground hover:bg-transparent rounded-md transition-colors opacity-0 group-hover:opacity-100 ${timerState === "running" ? "invisible" : ""}`}
                  >
                    <X size={18} />
                  </button>
                </div>
              </CardContent>
            </Card>
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

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default App;
