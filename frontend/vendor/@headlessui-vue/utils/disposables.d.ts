export type Disposables = ReturnType<typeof disposables>;
export declare function disposables(): {
    addEventListener<TEventName extends keyof WindowEventMap>(element: HTMLElement | Window | Document, name: TEventName, listener: (event: WindowEventMap[TEventName]) => any, options?: boolean | AddEventListenerOptions): void;
    requestAnimationFrame(callback: FrameRequestCallback): void;
    nextFrame(callback: FrameRequestCallback): void;
    setTimeout(callback: (...args: any[]) => void, ms?: number | undefined, ...args: any[]): void;
    add(cb: () => void): void;
    style(node: HTMLElement, property: string, value: string): void;
    dispose(): void;
};
