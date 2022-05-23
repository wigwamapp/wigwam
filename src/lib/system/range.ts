export function range(start: number, stop: number): number[] {
  return Array.from({ length: stop - start }, (_, i) => start + i);
}
