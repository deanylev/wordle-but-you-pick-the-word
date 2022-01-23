import { Component } from 'react';

import { Letter } from '../Keyboard';
import Tile from '../Tile';

import getLetterCounts from '../../utils/getLetterCounts';

import './style.scss';

interface Props {
  absentLetters?: Letter[];
  active?: boolean;
  actualWord?: string;
  correctLetters?: Partial<Record<number, Letter>>;
  done?: boolean;
  presentLetters?: Letter[];
  shake?: boolean;
  won?: boolean;
  word: Letter[];
}

export default class TileRow extends Component<Props> {
  getStatus(letter: Letter, index: number, letterCounts?: Record<string, number>) {
    const { absentLetters, active, correctLetters, done, presentLetters } = this.props;

    if ((active && !done) || !(letter && absentLetters && correctLetters && presentLetters)) {
      return undefined;
    }

    if (absentLetters.includes(letter) || letterCounts?.[letter] === 0) {
      return 'absent';
    }

    if (correctLetters[index] === letter) {
      if (letterCounts) {
        letterCounts[letter]--;
      }
      return 'correct';
    }

    if (presentLetters.includes(letter)) {
      if (letterCounts) {
        letterCounts[letter]--;
      }
      return 'present';
    }

    return undefined;
  }

  render() {
    const { actualWord, shake, won, word } = this.props;
    const letterCounts = actualWord && getLetterCounts(actualWord) || undefined;
    return (
      <div className={`TileRow ${shake ? 'shake' : ''}`}>
        {Array.from(new Array(5), (_, index) => {
          const letter = word[index];
          return (
            <Tile
              bounce={won}
              index={index}
              key={index}
              letter={letter}
              status={this.getStatus(letter, index, letterCounts)}
            />
          );
        })}
      </div>
    );
  }
}
