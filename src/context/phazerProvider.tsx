import useTimer, { type TimerStatus } from "../useTimer";
import { createContext, useContext, useReducer, type ReactNode } from "react";

export interface Timer {
  status: TimerStatus;
  timeRemainingMs: number;
  set: (timeMs: number, startTimer?: boolean) => void;
  start: (timeMs: number) => void;
  pause: () => void;
  resume: () => void;
  reset: (timeMs?: number) => void;
  clear: () => void;
}

export interface PhaseObject {
  id: number;
  name: string;
  durationMins: number; // minutes
  status: "pending" | "active" | "paused" | "complete";
}

type PhazerState = {
  phases: PhaseObject[];
  activePhaseId: number | null;
  shouldContinue?: boolean;
};

type PhazerAction =
  | { type: "START_MEETING"; phaseId: number; startTime: number }
  | { type: "PAUSE_CURRENT"; phaseId: number; elapsedTime: number }
  | { type: "RESUME_CURRENT"; phaseId: number; startTime: number }
  | {
      type: "COMPLETE_CURRENT";
      phaseId: number;
      endTime: number;
      elapsedTime: number;
    }
  | { type: "RESET_CURRENT"; phaseId: number }
  | { type: "ADD_PHASE"; phase: PhaseObject }
  | {
      type: "UPDATE_PHASE";
      phaseId: number;
      name?: PhaseObject["name"];
      durationMins?: PhaseObject["durationMins"];
      status?: PhaseObject["status"];
    }
  | { type: "DELETE_PHASE"; phaseId: number }
  | { type: "CLEAR_ALL" };

function phazerReducer(state: PhazerState, action: PhazerAction): PhazerState {
  switch (action.type) {
    case "START_MEETING": {
      if (!state.phases.length) return state;
      const firstPhase = state.phases[0];
      if (firstPhase.status === "complete") return state;

      return {
        ...state,
        activePhaseId: firstPhase.id,
        phases: state.phases.map((p) =>
          p.id === firstPhase.id ? { ...p, status: "active" as const } : p,
        ),
      };
    }
    case "PAUSE_CURRENT":
      if (!state.activePhaseId) return state;
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.id === state.activePhaseId
            ? { ...p, status: "paused" as const }
            : p,
        ),
      };
    case "RESUME_CURRENT":
      if (!state.activePhaseId) return state;
      return {
        ...state,
        phases: state.phases.map((p) =>
          p.id === state.activePhaseId
            ? { ...p, status: "active" as const }
            : p,
        ),
      };
    case "COMPLETE_CURRENT": {
      if (!state.activePhaseId) return state;
      const currentActivePhaseId = action.phaseId;
      const nextActivePhaseId = currentActivePhaseId + 1;
      const updatedPhases = state.phases.map((p) => {
        // update current phase to 'complete'
        if (p.id === currentActivePhaseId) {
          return { ...p, status: "complete" as const };
        }
        // update next phase to 'active'
        if (
          nextActivePhaseId < state.phases.length + 1 &&
          p.id === nextActivePhaseId
        ) {
          return { ...p, status: "active" as const };
        }
        return p;
      });
      const nextPhase = updatedPhases.find((p) => p.id === nextActivePhaseId);
      return {
        phases: updatedPhases,
        activePhaseId: nextPhase ? nextPhase.id : null,
        shouldContinue: !!nextPhase,
      };
    }
    case "ADD_PHASE":
      return {
        ...state,
        phases: [...state.phases, action.phase],
      };
    case "UPDATE_PHASE": {
      const nextPhases = state.phases.map((p) => {
        if (p.id === action.phaseId) {
          p.name = action.name || p.name;
          p.durationMins = action.durationMins || p.durationMins;
          p.status = action.status || p.status;
        }
        return p;
      });
      return {
        ...state,
        phases: [...nextPhases],
      };
    }
    case "DELETE_PHASE": {
      const filteredPhases = state.phases.filter(
        (p) => p.id !== action.phaseId,
      );
      const wasActive = state.activePhaseId === action.phaseId;
      return {
        phases: filteredPhases,
        activePhaseId: wasActive ? null : state.activePhaseId,
      };
    }
    case "RESET_CURRENT":
      console.log("reset triggered: ", { action, state });
      return {
        ...state,
        activePhaseId: action.phaseId,
        phases: state.phases.map((p) => {
          if (p.id === action.phaseId) {
            return {
              ...p,
              status: "pending",
            };
          }
          return p;
        }),
      };
    case "CLEAR_ALL": {
      return {
        phases: state.phases.map((p) => {
          return {
            ...p,
            status: "pending",
          };
        }),
        activePhaseId: null,
      };
    }
    default:
      return state;
  }
}

interface PhazerContextValue {
  timer: Timer;
  phases: PhaseObject[];
  activePhaseId: number | null;
  shouldContinue?: boolean;
  dispatch: React.Dispatch<PhazerAction>;
}

// Temp data during testing
const phaseData = [
  {
    id: 1,
    name: "Background",
    durationMins: 0.1,
    status: "pending" as const,
  },
  {
    id: 2,
    name: "Vector Embedding Storage",
    durationMins: 0.2,
    status: "pending" as const,
  },
  {
    id: 3,
    name: "Search Algorithms",
    durationMins: 0.05,
    status: "pending" as const,
  },
  {
    id: 4,
    name: "Q&A",
    durationMins: 0.15,
    status: "pending" as const,
  },
];

const PhazerContext = createContext<PhazerContextValue | null>(null);

export function PhazerProvider({ children }: { children: ReactNode }) {
  const timer = useTimer();
  const [state, dispatch] = useReducer(phazerReducer, {
    phases: phaseData,
    activePhaseId: null,
    shouldContinue: false,
  });

  return (
    <PhazerContext.Provider value={{ timer, ...state, dispatch }}>
      {children}
    </PhazerContext.Provider>
  );
}

export function usePhazer() {
  const ctx = useContext(PhazerContext);
  if (!ctx) throw new Error("usePhazer must be used within a PhazerProvider");
  return ctx;
}
