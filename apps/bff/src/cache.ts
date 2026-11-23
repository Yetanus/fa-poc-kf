interface Entry<V> {
  value: V;
  expiresAt: number;
}

export class TtlCache<K, V> {
  private readonly entries = new Map<K, Entry<V>>();

  constructor(private readonly ttlMs: number) {}

  get(key: K): V | undefined;
  get(key: K, load: () => Promise<V>): Promise<V>;
  get(key: K, load?: () => Promise<V>): V | undefined | Promise<V> {
    const entry = this.entries.get(key);
    const fresh = entry && entry.expiresAt > Date.now() ? entry.value : undefined;

    if (!load) return fresh;
    if (fresh !== undefined) return Promise.resolve(fresh);

    return load().then((value) => {
      this.set(key, value);
      return value;
    });
  }

  set(key: K, value: V): void {
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
