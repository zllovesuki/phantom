function EventsOnMultiple(eventName, callback, maxCallbacks) {
  return window.runtime.EventsOnMultiple(eventName, callback, maxCallbacks);
}

export function EventsOn(eventName, callback) {
  return EventsOnMultiple(eventName, callback, -1);
}
