import { Component } from 'react';

import { Letter } from '../Keyboard';
import Tile from '../Tile';

import './style.scss';

interface Props {
  absentLetters?: Letter[];
  active?: boolean;
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

    if (absentLetters.includes(letter)) {
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
    const { shake, won, word } = this.props;
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
              status={this.getStatus(letter, index)}
            />
          );
        })}
      </div>
    );
  }
}
