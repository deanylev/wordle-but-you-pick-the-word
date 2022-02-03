import { Component, MouseEvent } from 'react';

import isEqual from '../../utils/isEqual';

import './style.scss';

export type Letter = ' ' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

type Secret = [string, () => void];

interface Props {
  absentLetters?: Letter[];
  correctLetters?: Letter[];
  onBackspace: () => void;
  onEnter: () => void;
  onLetter: (letter: Letter) => void;
  presentLetters?: Letter[];
  secrets?: Secret[];
  showSpace?: boolean;
  spaceText?: string;
}

interface State {
  absentLetters: Letter[];
  correctLetters: Letter[];
  history: Letter[];
  presentLetters: Letter[];
}

export default class Keyboard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      absentLetters: this.props.absentLetters ?? [],
      correctLetters: this.props.correctLetters ?? [],
      history: [],
      presentLetters: this.props.presentLetters ?? []
    };

    this.handleEnter = this.handleEnter.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
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
      this.handleLetter(key.toLowerCase() as Letter);
    } else if (key === 'Backspace') {
      this.props.onBackspace();
    } else if (key === 'Enter') {
      this.handleEnter();
    } else if (key === ' ' && this.props.showSpace) {
      this.handleLetter(' ');
    }
  }

  handleEnter() {
    const { onEnter, secrets } = this.props;
    const { history } = this.state;

    try {
      if (secrets) {
        const enteredSecret = [...secrets]
          .sort((a, b) => b.length - a.length)
          .find(([string]) => {
            return history.slice(Math.max(0, history.length - string.length)).join('') === string;
          });
        if (enteredSecret) {
          enteredSecret[1]();
          return;
        }
      }
      onEnter();
    } finally {
      this.setState({
        history: []
      });
    }
  }

  handleLetter(letter: Letter) {
    const history = [...this.state.history, letter];
    this.setState({
      history: history.slice(Math.max(0, history.length - 100))
    });
    this.props.onLetter(letter);
  }

  handleMouseDown(event: MouseEvent) {
    event.preventDefault();
  }

  renderKey(letter: Letter) {
    return (
      <button
        className={this.getLetterClass(letter)}
        key={letter}
        onClick={() => this.handleLetter(letter)}
        onMouseDown={this.handleMouseDown}
      >
        {letter}
      </button>
    );
  }

  render() {
    const { onBackspace, onLetter, showSpace, spaceText } = this.props;

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
          <button className="wide" onClick={this.handleEnter} onMouseDown={this.handleMouseDown}>enter</button>
          {
            ['z', 'x', 'c', 'v', 'b', 'n', 'm']
              .map((letter) => this.renderKey(letter as Letter))
          }
          <button className="wide" onClick={onBackspace} onMouseDown={this.handleMouseDown}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path fill="#d7dadc" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
            </svg>
          </button>
        </div>
        {showSpace && (
          <div>
            <div></div>
            <button className="doubleWide" onClick={() => onLetter(' ')} onMouseDown={this.handleMouseDown}>{spaceText}</button>
            <div></div>
          </div>
        )}
      </div>
    );
  }
}
