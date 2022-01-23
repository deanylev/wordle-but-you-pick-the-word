import { Letter } from '../components/Keyboard';
import { Status } from '../components/Tile';

export default function getLetterStatuses(actualWord: string, word: Letter[], statusFn: (letter: Letter, index: number) => Status | undefined) {
  const letterCounts: Record<string, number> = {};
  actualWord.split('').forEach((letter) => {
    if (!(letter in letterCounts)) {
      letterCounts[letter] = 0;
    }

    letterCounts[letter]++;
  });

  const lettersSortedByStatus = word
    .map((letter, index) => ({
      letter,
      originalIndex: index,
      status: statusFn(letter, index)
    }))
    .sort(({ status: a }, { status: b }) => {
      if (a === b) {
        return 0;
      }

      if (a === 'correct') {
        return -1;
      }

      if (b === 'correct') {
        return 1;
      }

      if (a === 'present') {
        return 1;
      }

      return -1;
    });

  const normalisedLettersSortedByStatus: typeof lettersSortedByStatus = [];
  for (const { letter, originalIndex, status } of lettersSortedByStatus) {
    if (letterCounts?.[letter] === 0) {
      normalisedLettersSortedByStatus.push({
        letter,
        originalIndex,
        status: 'absent'
      });
      continue;
    }

    if (status && status !== 'absent' && letterCounts) {
      letterCounts[letter]--;
    }

    normalisedLettersSortedByStatus.push({
      letter,
      originalIndex,
      status
    });
  }

  normalisedLettersSortedByStatus.sort(({ originalIndex: a }, { originalIndex: b }) => a - b);
  return normalisedLettersSortedByStatus;
}
