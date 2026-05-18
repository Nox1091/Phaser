import { useState } from "react";
import { Badge } from "./components/ui/badge";
import { Card, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { usePhazer } from "./context/phazerProvider";
import { type TimerStatus } from "./useTimer";
import { X } from "lucide-react";
import useEvent from "./useEvent";

const PhaseManager = ({
  clearTimer,
  timerStatus,
}: {
  clearTimer: () => void;
  timerStatus: TimerStatus;
}) => {
  const { dispatch, phases, activePhaseId } = usePhazer();
  const totalDuration = phases.reduce((sum, p) => sum + p.durationMins, 0);

  //#region Register Timer Event Handlers to Service Bus
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
  //#endregion

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
        status: "pending",
      },
    });
  };

  return (
    <>
      <div className="mb-6 text-sm text-muted-foreground">
        <span>{phases.length} phases</span>
        <span className="mx-2">·</span>
        <span>total {totalDuration} min</span>
      </div>
      <div className="relative border border-[#ec00ff]/75 rounded-b-sm p-4 mt-2 mb-6">
        <span className="absolute -top-2 left-3 bg-background px-2 text-xs text-[#ec00ff] tracking-widest uppercase font-mono">
          Phase Queue
        </span>
        <div className="space-y-2">
          {phases.map((phase, index) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              index={index}
              status={timerStatus}
              onDelete={deletePhase}
            />
          ))}
        </div>
      </div>

      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
        <button
          onClick={addPhase}
          className="text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          + Add phase
        </button>
      </div>
    </>
  );
};

const PhaseCard = ({
  phase,
  index,
  status,
  onDelete,
}: {
  phase: { id: number; name: string; durationMins: number; status: string };
  index: number;
  status: TimerStatus;
  onDelete: (id: number) => void;
}) => {
  const { dispatch } = usePhazer();

  const formatStatusDisplay = (status: string) => {
    if (status === "pending") return "Pending";
    if (status === "complete") return "Complete";
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: We'll optimize this later so we're not re-rendering on every keystroke
    if (event.target.id === "phase-name-input")
      dispatch({
        type: "UPDATE_PHASE",
        phaseId: phase.id,
        name: event.target.value,
      });

    if (event.target.id === "phase-duration-input")
      dispatch({
        type: "UPDATE_PHASE",
        phaseId: phase.id,
        durationMins: parseInt(event.target.value),
      });
  };

  return (
    <Card
      key={phase.id}
      className={`bg-card border hover:border-opacity-80 transition-colors group h-10 p-0 ${getStatusBorderColor(phase.status)}`}
    >
      <CardContent className="p-1 flex items-center justify-between">
        <div className="flex items-center gap-4 grow shrink-0 basis-auto">
          <span className="text-muted-foreground font-medium text-lg text-center">
            {index + 1}
          </span>
          <span className="text-foreground font-medium">
            <Input
              autoFocus
              className="border-none dark:bg-transparent focus-visible:ring-0 align-end"
              placeholder={"enter phase"}
              onChange={handleInput}
              tabIndex={index + 1}
              id={"phase-name-input"}
            />
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center text-muted-foreground">
            <Input
              autoFocus
              className="border-none dark:bg-transparent focus-visible:ring-0 text-right"
              placeholder={"25"}
              onChange={handleInput}
              tabIndex={index + 2}
              id={"phase-duration-input"}
            />
            <span className="text-xs">min</span>
          </div>
          <Badge
            variant="default"
            className={`rounded-full p-1 w-24 flex justify-center ${getStatusColor(phase.status)}`}
          >
            {formatStatusDisplay(phase.status)}
          </Badge>
          <button
            onClick={() => onDelete(phase.id)}
            className={`p-2 text-muted-foreground hover:text-foreground hover:bg-transparent rounded-md transition-colors opacity-0 group-hover:opacity-100 ${status === "active" ? "invisible" : ""}`}
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
    case "pending":
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
    case "pending":
      return "bg-gray-500/80 text-white";
    default:
      return "bg-gray-500/80 text-white";
  }
};

export default PhaseManager;
