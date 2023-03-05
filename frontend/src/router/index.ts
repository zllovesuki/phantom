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
    redirect: "/tunnel",
  },
  {
    path: "/tunnel",
    name: "tunnel",
    component: lazy("TunnelsView"),
    meta: {
      displayName: "Reverse Tunnel",
    },
  },
  {
    path: "/forward",
    name: "forward",
    component: lazy("ForwardView"),
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

const routeOrder: Record<string, number> = routes
  .filter((c) => c.component !== undefined)
  .reduce((a, c, i) => {
    a[c.name ? c.name.toString() : ""] = i;
    return a;
  }, {} as Record<string, number>);
const numRoutes = Object.keys(routeOrder).length;

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.afterEach((to, from, failure) => {
  if (failure) return;

  const title = "Phantom - " + to.meta.displayName;
  WindowSetTitle(title);

  const fromPos = routeOrder[from.name ? from.name.toString() : ""];
  const toPos = routeOrder[to.name ? to.name.toString() : ""];

  if (fromPos === 0 && toPos === numRoutes - 1) {
    to.meta.transition = "right";
  } else if (fromPos === numRoutes - 1 && toPos === 0) {
    to.meta.transition = "left";
  } else {
    to.meta.transition = toPos < fromPos ? "right" : "left";
  }
});

export default router;
