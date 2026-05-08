import { useState } from "react";
import { Badge } from "./components/ui/badge";
import { Card, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { usePhazer } from "./context/phazerProvider";
import { type TimerStatus } from "./useTimer";
import { X } from "lucide-react";

const PhaseManager = ({
  clearTimer,
  timerStatus,
}: {
  clearTimer: () => void;
  timerStatus: TimerStatus;
}) => {
  const { dispatch, phases } = usePhazer();
  const totalDuration = phases.reduce((sum, p) => sum + p.durationMins, 0);

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
      <div className="space-y-3 mb-8">
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
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("New Phase");
  const { dispatch } = usePhazer();

  const formatStatusDisplay = (status: string) => {
    if (status === "pending") return "Pending";
    if (status === "complete") return "Complete";
    return status?.charAt(0).toUpperCase() + status?.slice(1);
  };

  const toggleEdit = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    setIsEditing(!isEditing);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);

    // TODO: We'll optimize this later so we're not re-rendering on every keystroke
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
