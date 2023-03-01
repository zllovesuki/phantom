/* eslint-disable @typescript-eslint/no-explicit-any */
// patched version of EventsOn, see https://github.com/wailsapp/wails/issues/2433
export function EventsOn(
  eventName: string,
  callback: (...data: any) => void
): () => void;
