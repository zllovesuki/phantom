import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import ClientConfiguration from "@/views/ClientConfiguration.vue"
import TunnelsView from "@/views/TunnelsView.vue"

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
        component: () => import("@/views/DebugView.vue"),
        meta: {
            displayName: "Debug"
        }
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;