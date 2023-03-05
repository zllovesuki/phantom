import "vue-router";

type TransitionDirection = "left" | "right";

declare module "vue-router" {
  interface RouteMeta {
    displayName: string;
    transition?: TransitionDirection;
  }
}

declare global {
  interface Window {
    loading_screen: {
      finish: () => void;
    };
  }
}
