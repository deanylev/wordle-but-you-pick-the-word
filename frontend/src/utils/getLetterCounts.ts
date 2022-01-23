export default function getLetterCounts(word: string) {
  const ret: Record<string, number> = {};
  word.split('').forEach((letter) => {
    if (!(letter in ret)) {
      ret[letter] = 0;
    }

    ret[letter]++;
  });

  return ret;
}
