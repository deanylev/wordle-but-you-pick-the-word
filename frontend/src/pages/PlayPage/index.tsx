import { Component, createRef } from 'react';

import Modal from 'react-modal';
import { Navigate } from 'react-router-dom';

import Keyboard, { Letter } from '../../components/Keyboard';
import { OnToast } from '../../components/Toaster';
import TileRow from '../../components/TileRow';
import fetchApi from '../../utils/fetchApi';
import getLetterCounts from '../../utils/getLetterCounts';
import getRandomElement from '../../utils/getRandomElement';
import makeUnique from '../../utils/makeUnique';

import './style.scss';

interface Props {
  onToast: OnToast;
}

interface State {
  absentLetters: Letter[];
  activeWordIndex: number;
  boardHeight: number;
  boardWidth: number;
  correctLetters: Partial<Record<number, Letter>>;
  goHome: boolean;
  loading: boolean;
  modalOpen: boolean;
  presentLetters: Letter[];
  shake: boolean;
  status: 'lost' | 'playing' | 'revealing' | 'won';
  word: string;
  words: Letter[][];
}

const MAX_BOARD_HEIGHT = 396;
const MAX_BOARD_WIDTH = 330;
const NUM_WORDS = 6;
const WORD_LENGTH = 5;
const WIN_WORDS = ['Genius', 'Magnificent' ,'Impressive', 'Splendid', 'Great', 'Phew'];

export default class PlayPage extends Component<Props, State> {
  tilesRef = createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      absentLetters: [],
      activeWordIndex: 0,
      boardHeight: MAX_BOARD_HEIGHT,
      boardWidth: MAX_BOARD_WIDTH,
      correctLetters: {},
      goHome: false,
      loading: true,
      modalOpen: false,
      presentLetters: [],
      shake: false,
      status: 'playing',
      word: '',
      words: new Array(NUM_WORDS).fill([])
    };

    this.handleBackspace = this.handleBackspace.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleLetter = this.handleLetter.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleShare = this.handleShare.bind(this);
  }

  get short() {
    return window.location.pathname.slice(1);
  }

  get locked() {
    return this.state.status !== 'playing';
  }

  async componentDidMount() {
    const response = await fetchApi('GET', `words/${this.short}`);
    if (!response.ok) {
      this.setState({
        loading: false
      });
      return;
    }

    const { word } = await response.json();
    this.setState({
      loading: false,
      word
    });

    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleBackspace() {
    if (this.locked) {
      return;
    }

    const { activeWordIndex, words } = this.state;
    const word = words[activeWordIndex];
    if (word.length === 0) {
      return;
    }

    const clonedWords = [...words];
    clonedWords[activeWordIndex] = word.slice(0, -1);

    this.setState({
      words: clonedWords
    });
  }

  async handleEnter() {
    if (this.locked) {
      return;
    }

    const { absentLetters, activeWordIndex, correctLetters, presentLetters, word, words } = this.state;
    const guess = words[activeWordIndex];
    if (guess.length !== WORD_LENGTH) {
      this.props.onToast('Not enough letters');
      this.setState({
        shake: true
      });
      setTimeout(() => {
        this.setState({
          shake: false
        });
      }, 650);
      return;
    }

    this.setState({
      status: 'revealing'
    });
    const absent = new Set<Letter>();
    const correct: Record<number, Letter> = {};
    const present = new Set<Letter>();
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (!word.includes(guess[i])) {
        absent.add(guess[i]);
        continue;
      }

      if (guess[i] === word[i]) {
        correct[i] = guess[i];
        continue;
      }

      present.add(guess[i]);
    }
    const newCorrectLetters = { ...correct, ...correctLetters };
    const isDone = activeWordIndex === words.length - 1;
    const didWin = Object.keys(newCorrectLetters).length === WORD_LENGTH;
    const newActiveWordIndex = (isDone || didWin) ? activeWordIndex : activeWordIndex + 1;
    this.setState({
      absentLetters: makeUnique([...absent, ...absentLetters]),
      activeWordIndex: newActiveWordIndex,
      correctLetters: newCorrectLetters,
      presentLetters: makeUnique([...present, ...presentLetters])
    });
    if (didWin) {
      this.setState({
        status: 'won'
      });

      setTimeout(() => {
        this.props.onToast(getRandomElement(WIN_WORDS), 2000);
      }, 500 * 5);
    } else if (isDone) {
      this.setState({
        status: 'lost'
      });

      setTimeout(() => {
        this.props.onToast(word.toUpperCase(), null);
      }, 500 * 5);
    } else {
      setTimeout(() => {
        this.setState({
          status: 'playing'
        });
      }, 500 * 5);
    }

    if (didWin || isDone) {
      setTimeout(() => {
        this.setState({
          modalOpen: true
        });
      }, 500 * 5 + 2000);
    }
  }

  handleLetter(letter: Letter) {
    if (this.locked) {
      return;
    }

    const { activeWordIndex, words } = this.state;
    const word = words[activeWordIndex];
    if (word.length === WORD_LENGTH) {
      return;
    }

    const clonedWords = [...words];
    clonedWords[activeWordIndex] = [...word, letter];

    this.setState({
      words: clonedWords
    });
  }

  handleModalClose() {
    this.setState({
      modalOpen: false
    });
  }

  handleResize() {
    const tiles = this.tilesRef.current;
    if (!tiles) {
      return;
    }

    const boardWidth = Math.min(Math.floor(tiles.clientHeight * 0.8 * (5 / 6)), MAX_BOARD_WIDTH);
    const boardHeight = 6 * Math.floor(boardWidth / 5);
    this.setState({
      boardHeight,
      boardWidth
    });
  }

  async handleShare() {
    const { absentLetters, activeWordIndex, correctLetters, presentLetters, status, word: actualWord, words } = this.state;
    const row = status === 'won' ? activeWordIndex + 1 : 'X';
    const emojis = words.slice(0, activeWordIndex + 1).map((word) => {
      const letterCounts = getLetterCounts(actualWord);

      return word.map((letter, index) => {
        if (absentLetters.includes(letter) || letterCounts[letter] === 0) {
          return '⬛';
        }

        if (correctLetters[index] === letter) {
          letterCounts[letter]--;
          return '🟩';
        }

        if (presentLetters.includes(letter)) {
          letterCounts[letter]--;
          return '🟨';
        }

        return '😳';
      }).join('');
    }).join('\n');
    const text = `Wordle (but you pick the word) ${this.short} ${row}/${NUM_WORDS}\n\n${emojis}`;
    if (navigator.share) {
      navigator.share({
        text
      });
    } else {
      try {
        await navigator.clipboard.writeText(text);
        this.props.onToast('Copied results to clipboard', 2000);
      } catch {
        this.props.onToast('I\'m afraid I can\'t do that, Dave', 2000);
      }
    }
  }

  render() {
    const { absentLetters, activeWordIndex, boardHeight, boardWidth, correctLetters, goHome, loading, modalOpen, presentLetters, shake, status, word: actualWord, words } = this.state;

    if (goHome) {
      return <Navigate to="/" />
    }

    if (loading) {
      return <div className="PlayPage-status">Loading...</div>;
    } else if (!actualWord) {
      return <div className="PlayPage-status">Word not found</div>;
    }

    return (
      <div className="PlayPage">
        <div className="tiles" ref={this.tilesRef}>
          <div className="innerWrapper" style={{ height: boardHeight, width: boardWidth }}>
            {words.map((word, index) => {
              const active = activeWordIndex === index;
              const won = status === 'won';
              return (
                <TileRow
                  absentLetters={absentLetters}
                  active={active}
                  actualWord={actualWord}
                  correctLetters={correctLetters}
                  done={(won || status === 'lost') && active}
                  key={index}
                  presentLetters={presentLetters}
                  shake={shake && active}
                  won={won && active}
                  word={word}
                />
              );
            })}
          </div>
        </div>
        <Keyboard
          absentLetters={absentLetters}
          correctLetters={makeUnique(Object.values(correctLetters) as Letter[])}
          onBackspace={this.handleBackspace}
          onEnter={this.handleEnter}
          onLetter={this.handleLetter}
          presentLetters={presentLetters}
        />
        <Modal
          ariaHideApp={false}
          isOpen={modalOpen}
          onRequestClose={this.handleModalClose}
          style={{
            content: {
              background: '#121213',
              border: '0',
              margin: 'auto',
              maxHeight: 440,
              maxWidth: 500
            },
            overlay: {
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 2
            }
          }}
        >
          <div className="PlayPage-modal">
            A website by Dean Levinson
            <button onClick={() => this.setState({ goHome: true })}>
              CHOOSE YOUR OWN
            </button>
            <button onClick={this.handleShare}>
              SHARE
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path fill="#d7dadc" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"></path>
              </svg>
            </button>
          </div>
        </Modal>
      </div>
    );
  }
}
