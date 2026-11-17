export const randInt = (n: number) => Math.floor(Math.random() * n);

export const pick = <T,>(items: readonly T[]): T => items[randInt(items.length)];

export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
