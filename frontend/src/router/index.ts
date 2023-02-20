import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";

export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "home",
        component: HomeView,
        meta: {
            displayName: "Home"
        }
    },
    {
        path: "/tunnel",
        name: "tunnel",
        component: () => import("@/views/TunnelsView.vue"),
        meta: {
            displayName: "Create Tunnels"
        }
    },
    {
        path: "/forward",
        name: "forward",
        component: HomeView,
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