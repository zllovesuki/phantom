import { ref } from "vue";
import { defineStore } from "pinia";

import {
  EventsOn,
  Environment,
  type EnvironmentInfo,
} from "~/wails/runtime/runtime";
import { Connected } from "~/wails/go/specter/Application";
import broker from "~/events";

export const useRuntimeStore = defineStore("runtime", () => {
  const ClientConnecting = ref<boolean>(false);
  const ClientConnected = ref<boolean>(false);
  const environment = ref<EnvironmentInfo>();

  Promise.all([Environment(), Connected()]).then(([env, c]) => {
    environment.value = env;
    ClientConnected.value = c;
  });

  EventsOn("specter:Connecting", () => {
    ClientConnecting.value = true;
    broker.emit("specter:Connecting");
  });

  EventsOn("specter:Connected", () => {
    ClientConnected.value = true;
    ClientConnecting.value = false;
    broker.emit("specter:Connected");
  });

  EventsOn("specter:Disconnected", () => {
    ClientConnected.value = false;
    ClientConnecting.value = false;
    broker.emit("specter:Disconnected");
  });

  EventsOn("forwarder:Started", (l) => {
    broker.emit("forwarder:Started", l);
  });

  EventsOn("forwarder:Stopped", (l) => {
    broker.emit("forwarder:Stopped", l);
  });

  return {
    ClientConnecting,
    ClientConnected,
    environment,
  };
});
