import { ChangeEvent, Component } from 'react';

import { Navigate } from 'react-router-dom';

import Keyboard, { Letter } from '../../components/Keyboard';
import TileRow from '../../components/TileRow';
import { OnToast } from '../../components/Toaster';
import allWords from '../../globals/allWords';
import viableWords from '../../globals/viableWords';
import fetchApi from '../../utils/fetchApi';
import getRandomElement from '../../utils/getRandomElement';

import './style.scss';

interface Props {
  onToast: OnToast;
}

interface State {
  boardHeight: number;
  boardWidth: number;
  numLetters: number;
  realWords: boolean;
  shake: boolean;
  short: string | null;
  word: Letter[];
}

const LS_KEY = 'usedRandomWords';

export default class CreatePage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      boardHeight: 66,
      boardWidth: 330,
      numLetters: 5,
      realWords: false,
      shake: false,
      short: null,
      word: []
    };

    this.handleBackspace = this.handleBackspace.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleGetRandomWord = this.handleGetRandomWord.bind(this);
    this.handleGetTodaysWord = this.handleGetTodaysWord.bind(this);
    this.handleLetter = this.handleLetter.bind(this);
    this.handleNumLettersChange = this.handleNumLettersChange.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  async create(word: string, realWords: boolean) {
    const response = await fetchApi('POST', 'words', {
      realWords,
      word
    });
    const { short } = await response.json();
    this.setState({
      short
    });
  }

  async componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleBackspace() {
    const { word } = this.state;
    if (word.length === 0) {
      return;
    }

    this.setState({
      word: word.slice(0, -1)
    });
  }

  async handleEnter() {
    const shake = () => {
      this.setState({
        shake: true
      });
      setTimeout(() => {
        this.setState({
          shake: false
        });
      }, 650);
    };

    const { numLetters, realWords, word } = this.state;
    if (word.length !== numLetters) {
      this.props.onToast('Not enough letters');
      shake();
      return;
    }

    const joinedWord = word.join('');
    if (realWords && !allWords.includes(joinedWord)) {
      this.props.onToast('Not in word list');
      shake();
      return;
    }

    await this.create(joinedWord, realWords);
  }

  handleGetTodaysWord() {
    const originalDate = 1623934800000;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diff = now.getTime() - originalDate;
    const diffToDays = Math.floor(diff / 86400000);

    const word = viableWords[diffToDays - 1];
    if (!word) {
      this.props.onToast('No more words left!');
      return;
    }

    this.create(word, true);
  }

  handleGetRandomWord() {
    let usedWords = [];
    try {
      usedWords = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
    } catch {
      // swallow
    }

    if (usedWords.length === viableWords.length) {
      usedWords = [];
    }

    const word = getRandomElement(viableWords, usedWords);
    usedWords.push(word);
    localStorage.setItem(LS_KEY, JSON.stringify(usedWords));

    this.create(word, true);
  }

  handleLetter(letter: Letter) {
    const { numLetters, word } = this.state;
    if (word.length === numLetters) {
      return;
    }

    this.setState({
      word: [...word, letter]
    });
  }

  handleNumLettersChange(event: ChangeEvent<HTMLSelectElement>) {
    const numLetters =  parseInt(event.target.value, 10);
    this.setState({
      numLetters,
      realWords: this.state.realWords && numLetters === 5,
      word: this.state.word.slice(0, numLetters)
    }, this.handleResize);
  }

  handleResize() {
    const { numLetters } = this.state;
    const boardWidth = Math.min(window.innerWidth - 70, 66 * numLetters);
    const boardHeight = Math.floor(boardWidth / numLetters) - 8;
    this.setState({
      boardHeight,
      boardWidth
    });
  }

  render() {
    const { boardHeight, boardWidth, numLetters, realWords, shake, short, word } = this.state;
    if (short) {
      return <Navigate to={`/${short}`} />
    }

    return (
      <div className="CreatePage">
        <div className="input">
          <div className="hint">Enter a Word With the Keyboard:</div>
          <div className="tiles" style={{ height: boardHeight, width: boardWidth }}>
            <TileRow numLetters={numLetters} shake={shake} word={word} />
          </div>
          <div className="numLetters">
            Number of Letters:
            <select onChange={this.handleNumLettersChange} value={numLetters}>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
          </div>
          <label>
            Restrict to Real Words?
            <input checked={realWords} disabled={numLetters !== 5} onChange={() => this.setState({ realWords: !realWords })} type="checkbox" />
          </label>
          <div className="or">OR</div>
          <button onClick={this.handleGetRandomWord} onMouseDown={(event) => event.preventDefault()}>Get Random Word</button>
          <button onClick={this.handleGetTodaysWord} onMouseDown={(event) => event.preventDefault()}>Get Today's Word</button>
        </div>
        <Keyboard
          onBackspace={this.handleBackspace}
          onEnter={this.handleEnter}
          onLetter={this.handleLetter}
        />
      </div>
    );
  }
}
