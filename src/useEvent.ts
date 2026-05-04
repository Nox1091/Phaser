import { useEffect } from "react";
import eventBus, { type EventMap } from "./eventBus";

const useEvent = (eventName: keyof EventMap, handler: (arg: any) => void) => {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(eventName, handler);

    return () => {
      unsubscribe();
    };
  }, [eventName, handler]);
};

export default useEvent;
