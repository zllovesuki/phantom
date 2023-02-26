import { ref } from "vue";
import { defineStore } from "pinia";
import type { AlertLevel } from "~/components/AlertSection.vue";

export const useAlertStore = defineStore("alert", () => {
  const message = ref<string>("");
  const level = ref<AlertLevel>("info");
  const show = ref<boolean>(false);

  function showAlert(l: AlertLevel, msg: string) {
    message.value = msg;
    level.value = l;
    show.value = true;
  }

  function hideAlert() {
    show.value = false;
  }

  return {
    message,
    level,
    show,
    showAlert,
    hideAlert,
  };
});
