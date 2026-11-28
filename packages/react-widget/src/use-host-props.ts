import { useSyncExternalStore } from 'react';
import type { HostProps } from './host-props';

export function useHostProps<T extends object>(host: HostProps<T>): T {
  return useSyncExternalStore(host.subscribe, host.get);
}
