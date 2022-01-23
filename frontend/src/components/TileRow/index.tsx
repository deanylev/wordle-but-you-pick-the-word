import { Component } from 'react';

import { Letter } from '../Keyboard';
import Tile, { Status } from '../Tile';

import getLetterStatuses from '../../utils/getLetterStatuses';

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
  getStatus(letter: Letter, index: number) {
    const { absentLetters, active, correctLetters, done, presentLetters } = this.props;

    if ((active && !done) || !(letter && absentLetters && correctLetters && presentLetters)) {
      return undefined;
    }

    if (absentLetters.includes(letter) ) {
      return 'absent';
    }

    if (correctLetters[index] === letter) {
      return 'correct';
    }

    if (presentLetters.includes(letter)) {
      return 'present';
    }

    return undefined;
  }

  render() {
    const { actualWord, shake, won, word } = this.props;
    const lettersSortedByStatus = word
      .map((letter, index) => ({
        letter,
        originalIndex: index,
        status: this.getStatus(letter, index) as Status
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

    const normalisedLettersSortedByStatus = getLetterStatuses(actualWord ?? '', word, this.getStatus.bind(this));

    return (
      <div className={`TileRow ${shake ? 'shake' : ''}`}>
        {Array.from(new Array(5), (_, index) => {
          const { letter = null, status } = normalisedLettersSortedByStatus[index] || {};
          return (
            <Tile
              bounce={won}
              index={index}
              key={index}
              letter={letter}
              status={status}
            />
          );
        })}
      </div>
    );
  }
}
