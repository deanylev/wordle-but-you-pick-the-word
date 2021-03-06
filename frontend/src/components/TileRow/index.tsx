import { Component, createRef } from 'react';

import { Letter } from '../Keyboard';
import Tile from '../Tile';

import getLetterStatuses from '../../utils/getLetterStatuses';

import './style.scss';

interface Props {
  absentLetters?: Letter[];
  active?: boolean;
  actualWord?: string;
  correctLetters?: Partial<Record<number, Letter>>;
  done?: boolean;
  numLetters: number;
  onTileClick?: (index: number) => void;
  presentLetters?: Letter[];
  selectedLetterIndex?: number;
  shake?: boolean;
  won?: boolean;
  word: Letter[];
}

export default class TileRow extends Component<Props> {
  firstTileRef = createRef<HTMLButtonElement>();

  componentDidMount() {
    setTimeout(() => {
      this.forceUpdate();
    });
  }

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
    const { actualWord, active, numLetters, onTileClick, selectedLetterIndex, shake, won, word } = this.props;
    const normalisedLettersSortedByStatus = getLetterStatuses(actualWord ?? '', word, this.getStatus.bind(this));

    const tileWidth = this.firstTileRef?.current?.offsetWidth;
    const fontSize = (tileWidth && Math.min(Math.ceil(tileWidth / 2), 32)) ?? 32;

    return (
      <div className={`TileRow ${shake ? 'shake' : ''}`} style={{ fontSize }}>
        {Array.from(new Array(numLetters), (_, index) => {
          const { letter = null, status } = normalisedLettersSortedByStatus[index] || {};
          return (
            <Tile
              bounce={won}
              clickable={!!active}
              index={index}
              key={index}
              letter={letter}
              numLetters={numLetters}
              onClick={() => {
                if (active) {
                  onTileClick?.(index);
                }
              }}
              ref={index === 0 ? this.firstTileRef : undefined}
              selected={selectedLetterIndex === index}
              status={status}
            />
          );
        })}
      </div>
    );
  }
}
