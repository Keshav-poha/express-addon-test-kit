/**
 * A minimal typed event emitter that dispatches events asynchronously via `queueMicrotask`.
 * All handlers for a given event are captured at emit time to avoid issues with mid-dispatch mutations.
 *
 * @typeParam EventMap - A record mapping event name strings to their payload types.
 */
export class TypedEventEmitter<EventMap> {
    private readonly handlers = new Map<keyof EventMap, Set<(data: unknown) => void>>();

    /**
     * Registers a handler for the named event.
     *
     * @param name - The event name.
     * @param handler - The function to call when the event fires.
     */
    on<K extends keyof EventMap>(name: K, handler: (data: EventMap[K]) => void): void {
        if (!this.handlers.has(name)) {
            this.handlers.set(name, new Set());
        }
        this.handlers.get(name)!.add(handler as (data: unknown) => void);
    }

    /**
     * Unregisters a previously registered handler.
     *
     * @param name - The event name.
     * @param handler - The exact handler reference passed to `on()`.
     */
    off<K extends keyof EventMap>(name: K, handler: (data: EventMap[K]) => void): void {
        this.handlers.get(name)?.delete(handler as (data: unknown) => void);
    }

    /**
     * Emits an event, invoking all registered handlers on the next microtask tick.
     *
     * @param name - The event name.
     * @param data - The payload passed to each handler.
     */
    emit<K extends keyof EventMap>(name: K, data: EventMap[K]): void {
        const handlers = this.handlers.get(name);
        if (handlers) {
            const snapshot = Array.from(handlers);
            queueMicrotask(() => {
                for (const handler of snapshot) {
                    handler(data);
                }
            });
        }
    }

    /**
     * Removes all registered event handlers across all event types.
     */
    removeAllListeners(): void {
        this.handlers.clear();
    }
}
