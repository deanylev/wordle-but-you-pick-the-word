export default function makeUnique<T>(array: T[]) {
  return [...new Set<T>(array)];
}
