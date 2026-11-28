import type { NewsItem } from '@fa/contracts';

export interface InsightsProps {
  items: NewsItem[];
  activeTags: string[];
  theme: 'light' | 'dark';
}

// props set on the element live here, React reads them with useSyncExternalStore
export class HostProps<T extends object> {
  private value: T;
  private readonly listeners = new Set<() => void>();

  constructor(initial: T) {
    this.value = initial;
  }

  readonly get = (): T => this.value;

  set(patch: Partial<T>): void {
    this.value = { ...this.value, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
}
