export class TypedEventEmitter<EventMap extends Record<string, any>> {
    private handlers = new Map<keyof EventMap, Set<Function>>();

    on<K extends keyof EventMap>(name: K, handler: (data: EventMap[K]) => void): void {
        if (!this.handlers.has(name)) {
            this.handlers.set(name, new Set());
        }
        this.handlers.get(name)!.add(handler);
    }

    off<K extends keyof EventMap>(name: K, handler: (data: EventMap[K]) => void): void {
        this.handlers.get(name)?.delete(handler);
    }

    emit<K extends keyof EventMap>(name: K, data: EventMap[K]): void {
        const handlers = this.handlers.get(name);
        if (handlers) {
            // Capture handlers array to avoid mutation during execution
            const handlersToCall = Array.from(handlers);
            queueMicrotask(() => {
                handlersToCall.forEach(handler => handler(data));
            });
        }
    }

    removeAllListeners(): void {
        this.handlers.clear();
    }
}
