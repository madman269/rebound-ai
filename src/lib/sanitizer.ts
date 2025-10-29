export function clampText(input: string, max = 2000) {
  const safe = input?.toString().replace(/\u0000/g, "");
  return safe.length > max ? safe.slice(0, max) : safe;
}
