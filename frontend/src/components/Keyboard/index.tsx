import { Component } from 'react';

import isEqual from '../../utils/isEqual';

import './style.scss';

export type Letter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

interface Props {
  absentLetters?: Letter[];
  correctLetters?: Letter[];
  onBackspace: () => void;
  onEnter: () => void;
  onLetter: (letter: Letter) => void;
  presentLetters?: Letter[];
}

interface State {
  absentLetters: Letter[];
  correctLetters: Letter[];
  presentLetters: Letter[];
}

export default class Keyboard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      absentLetters: [],
      correctLetters: [],
      presentLetters: []
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentDidUpdate() {
    const { absentLetters, correctLetters, presentLetters } = this.props;
    if (!(absentLetters && correctLetters && presentLetters)) {
      return;
    }

    if (isEqual(absentLetters, this.state.absentLetters) && isEqual(correctLetters, this.state.correctLetters) && isEqual(presentLetters, this.state.presentLetters)) {
      return;
    }

    setTimeout(() => {
      this.setState({
        absentLetters,
        correctLetters,
        presentLetters
      });
    }, 350 * 5);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  getLetterClass(letter: Letter) {
    const { absentLetters, correctLetters, presentLetters } = this.state;
    if (correctLetters?.includes(letter)) {
      return 'correct';
    }

    if (presentLetters?.includes(letter)) {
      return 'present';
    }

    if (absentLetters?.includes(letter)) {
      return 'absent';
    }

    return '';
  }

  handleKeyDown({ altKey, ctrlKey, key, metaKey }: KeyboardEvent) {
    if (altKey || ctrlKey || metaKey) {
      return;
    }

    if (/^[A-Za-z]$/.test(key)) {
      this.props.onLetter(key.toLowerCase() as Letter);
    } else if (key === 'Backspace') {
      this.props.onBackspace();
    } else if (key === 'Enter') {
      this.props.onEnter();
    }
  }

  renderKey(letter: Letter) {
    return <button className={this.getLetterClass(letter)} key={letter} onClick={() => this.props.onLetter(letter)}>{letter}</button>;
  }

  render() {
    const { onBackspace, onEnter } = this.props;

    return (
      <div className="Keyboard">
        <div>
          {
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
              .map((letter) => this.renderKey(letter as Letter))
          }
        </div>
        <div>
          <div></div>
          {
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
              .map((letter) => this.renderKey(letter as Letter))
          }
          <div></div>
        </div>
        <div>
          <button className="wide" onClick={onEnter}>enter</button>
          {
            ['z', 'x', 'c', 'v', 'b', 'n', 'm']
              .map((letter) => this.renderKey(letter as Letter))
          }
          <button className="wide" onClick={onBackspace}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path fill="#d7dadc" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
            </svg>
          </button>
        </div>
      </div>
    );
  }
}
