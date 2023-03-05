import { ref } from "vue";
import { defineStore } from "pinia";

import {
  EventsOn,
  Environment,
  type EnvironmentInfo,
  EventsEmit,
} from "~/wails/runtime/runtime";
import {
  AllForwardersStarted,
  Connected,
} from "~/wails/go/phantom/Application";
import { useLoadingStore } from "~/store/loading";
import broker from "~/events";

export const useRuntimeStore = defineStore("runtime", () => {
  const ClientConnecting = ref<boolean>(false);
  const ClientConnected = ref<boolean>(false);
  const ForwardersStarting = ref<boolean>(false);
  const ForwardersStarted = ref<boolean>(false);
  const environment = ref<EnvironmentInfo>();

  Promise.all([Environment(), Connected()]).then(([env, c]) => {
    environment.value = env;
    ClientConnected.value = c;
  });

  EventsOn("specter:Connecting", () => {
    const { setLoading } = useLoadingStore();
    ClientConnecting.value = true;
    broker.emit("specter:Connecting");
    setLoading(true);
  });

  EventsOn("specter:Connected", () => {
    const { setLoading } = useLoadingStore();
    ClientConnected.value = true;
    ClientConnecting.value = false;
    broker.emit("specter:Connected");
    setLoading(false);
  });

  EventsOn("specter:Disconnected", () => {
    const { setLoading } = useLoadingStore();
    ClientConnected.value = false;
    ClientConnecting.value = false;
    broker.emit("specter:Disconnected");
    setLoading(false);
  });

  EventsOn("forwarders:Starting", () => {
    const { setLoading } = useLoadingStore();
    ForwardersStarting.value = true;
    broker.emit("forwarders:Starting");
    setLoading(true);
  });

  EventsOn("forwarders:Started", () => {
    const { setLoading } = useLoadingStore();
    ForwardersStarted.value = true;
    ForwardersStarting.value = false;
    broker.emit("forwarders:Started");
    setLoading(false);
  });

  EventsOn("forwarders:Stopped", () => {
    const { setLoading } = useLoadingStore();
    ForwardersStarted.value = false;
    ForwardersStarting.value = false;
    broker.emit("forwarders:Stopped");
    setLoading(false);
  });

  EventsOn("forwarder:Started", (l) => {
    broker.emit("forwarder:Started", l);
  });

  EventsOn("forwarder:Stopped", (l) => {
    broker.emit("forwarder:Stopped", l);
  });

  // notify the backend to hydrate states if necessary
  EventsEmit("broker:Ready");

  async function reloadForwardersStatus() {
    ForwardersStarted.value = await AllForwardersStarted();
  }

  return {
    ForwardersStarted,
    ForwardersStarting,
    ClientConnecting,
    ClientConnected,
    environment,

    reloadForwardersStatus,
  };
});
