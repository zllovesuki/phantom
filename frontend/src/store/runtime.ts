import { ref } from "vue";
import { defineStore } from "pinia";

import { Environment, type EnvironmentInfo } from "~/wails/runtime/runtime";
import { Connected } from "~/wails/go/specter/Application";
import broker from "~/runtime/event";

export const useRuntimeStore = defineStore("runtime", () => {
  const ClientConnected = ref<boolean>(false);
  const environment = ref<EnvironmentInfo>();

  Environment().then((env) => {
    environment.value = env;
  });

  Connected().then((c) => {
    ClientConnected.value = c;
  });

  broker.on("specter:Connected", () => (ClientConnected.value = true));
  broker.on("specter:Disconnected", () => {
    ClientConnected.value = false;
  });

  return {
    ClientConnected,
    environment,
  };
});
