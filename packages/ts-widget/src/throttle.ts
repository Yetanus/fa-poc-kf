export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  ms: number,
): (...args: TArgs) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args) => {
    const remaining = ms - (Date.now() - last);
    if (remaining <= 0) {
      last = Date.now();
      fn(...args);
    } else if (timer === undefined) {
      // trailing call, so the last resize is not lost
      timer = setTimeout(() => {
        timer = undefined;
        last = Date.now();
        fn(...args);
      }, remaining);
    }
  };
}
