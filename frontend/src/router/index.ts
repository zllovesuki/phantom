import {
  createRouter,
  createWebHashHistory,
  type RouteComponent,
  type RouteRecordRaw,
} from "vue-router";
import { WindowSetTitle } from "~/wails/runtime/runtime";

function lazy(view: string): () => Promise<RouteComponent> {
  return () => import(`~/views/${view}.vue`);
}

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/config",
  },
  {
    path: "/config",
    name: "config",
    component: lazy("ClientConfiguration"),
    meta: {
      displayName: "Configure Client",
    },
  },
  {
    path: "/tunnel",
    name: "tunnel",
    component: lazy("TunnelsView"),
    meta: {
      displayName: "Configure Tunnels",
    },
  },
  {
    path: "/forward",
    name: "forward",
    component: lazy("HomeView"),
    meta: {
      displayName: "Local Forwarding",
    },
  },
  {
    path: "/debug",
    name: "debug",
    component: lazy("DebugView"),
    meta: {
      displayName: "Debug",
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.afterEach((to, from, failure) => {
  if (failure) return;
  const title = "Phantom - " + to.meta.displayName;
  WindowSetTitle(title);
});

export default router;
