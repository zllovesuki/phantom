import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: "/tunnel"
    },
    {
        path: "/config",
        name: "config",
        component: () => import("@/views/ClientConfiguration.vue"),
        meta: {
            displayName: "Configure Client"
        }
    },
    {
        path: "/tunnel",
        name: "tunnel",
        component: () => import("@/views/TunnelsView.vue"),
        meta: {
            displayName: "Configure Tunnels"
        }
    },
    {
        path: "/forward",
        name: "forward",
        component: () => import("@/views/HomeView.vue"),
        meta: {
            displayName: "Forward Connections"
        }
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;