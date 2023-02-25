import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import { WindowSetTitle } from "@wails/runtime/runtime"

import ClientConfiguration from "@/views/ClientConfiguration.vue"
import TunnelsView from "@/views/TunnelsView.vue"
import DebugView from "@/views/DebugView.vue"

export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: "/config"
    },
    {
        path: "/config",
        name: "config",
        component: ClientConfiguration,
        meta: {
            displayName: "Configure Client"
        }
    },
    {
        path: "/tunnel",
        name: "tunnel",
        component: TunnelsView,
        meta: {
            displayName: "Configure Tunnels"
        }
    },
    {
        path: "/forward",
        name: "forward",
        component: () => import("@/views/HomeView.vue"),
        meta: {
            displayName: "Local Forwarding"
        }
    },
    {
        path: "/debug",
        name: "debug",
        component: DebugView,
        meta: {
            displayName: "Debug"
        }
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.afterEach((to, from, failure) => {
    if (failure) return
    const title = 'Phantom - ' + to.meta.displayName
    WindowSetTitle(title)
})

export default router;