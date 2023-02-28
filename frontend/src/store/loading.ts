import { ref } from "vue";
import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", () => {
  const loading = ref<boolean>(false);

  function setLoading(v: boolean) {
    loading.value = v;
  }

  return {
    loading,
    setLoading,
  };
});
