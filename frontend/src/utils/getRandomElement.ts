export default function getRandomElement<T>(array: T[], usedValues?: T[]) {
  if (usedValues && array.length === usedValues.length) {
    throw new Error('array is same size as used values');
  }

  while (true) {
    const value = array[Math.floor(Math.random() * array.length)];
    if (!usedValues || !usedValues.includes(value)) {
      return value;
    }
  }
}
