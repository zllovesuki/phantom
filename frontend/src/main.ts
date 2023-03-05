import "@fontsource/inter/variable.css";
import "~/assets/main.css";

import App from "./App.vue";
import router from "./router";

import { createApp, watchEffect, h } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import { useSettingStore } from "~/store/setting";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp({
  setup() {
    const setting = useSettingStore();

    const applyDarkMode = () =>
      document.documentElement.classList[setting.darkMode ? "add" : "remove"](
        "dark"
      );

    watchEffect(applyDarkMode);

    return () => {
      return h(App);
    };
  },
});

app.use(pinia);
app.use(router);
app.mount("#app");
