import 'vue-router'

declare module 'vue-router' {
    interface RouteMeta {
        displayName: string
    }
}

declare global {
    interface Window {
        loading_screen: {
            finish: () => void
        }
    }
}