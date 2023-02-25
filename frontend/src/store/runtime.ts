import { ref } from "vue";
import { defineStore } from "pinia";
import { Environment, type EnvironmentInfo } from "~/wails/runtime/runtime";

export const useRuntimeStore = defineStore(
    "runtime",
    () => {
        const environment = ref<EnvironmentInfo>()

        Environment().then(env => {
            environment.value = env
        })

        return {
            environment
        };
    }
);
