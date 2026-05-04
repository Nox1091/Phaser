type Listener<T> = (arg: T) => void;

export type EventMap = {
  start_timer: { startTime: number };
  end_timer: { endTime: number; elapsedTime: number };
  pause_timer: { elapsedTime: number };
  resume_timer: { startTime: number };
  reset_timer: object;
  clear_timer: object;
};

const listeners = new Map<keyof EventMap, Set<Listener<any>>>();

const eventBus = {
  subscribe<K extends keyof EventMap>(
    eventName: K,
    handler: Listener<EventMap[K]>,
  ) {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set());
    }

    listeners.get(eventName)!.add(handler);

    return () => {
      listeners.get(eventName)!.delete(handler);
    };
  },

  emit<K extends keyof EventMap>(eventName: K, payload: EventMap[K]) {
    listeners.get(eventName)?.forEach((handler) => {
      (handler as Listener<EventMap[K]>)(payload);
    });
  },
};

export default eventBus;
