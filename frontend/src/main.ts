import { createApp, watchEffect, h } from 'vue'
import { createPinia } from 'pinia'
import { useSettingStore } from "./store/setting";

import App from './App.vue'
import router from "./router";

const pinia = createPinia();
const app = createApp({
    setup() {
        const setting = useSettingStore();
        const applyDarkMode = () =>
            document.documentElement.classList[setting.darkMode ? "add" : "remove"](
                "dark"
            );
        watchEffect(applyDarkMode);
    },
    render: () => h(App),
});

app.use(pinia)
app.use(router)
app.mount('#app')
