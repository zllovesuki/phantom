import { ref } from "vue";
import { defineStore } from "pinia";

export const useStyle = defineStore("style", () => {
  const backgroundColors = ref<string[]>([]);

  return {
    backgroundColors,
  };
});
