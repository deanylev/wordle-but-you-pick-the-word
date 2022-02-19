import { Component } from 'react';

import cloneDeep from 'lodash.clonedeep';
import Modal from 'react-modal';
import { Navigate } from 'react-router-dom';

import Keyboard, { Letter } from '../../components/Keyboard';
import { OnClearToasts, OnToast } from '../../components/Toaster';
import TileRow from '../../components/TileRow';
import includes from '../../globals/allWords';
import dateIsToday  from '../../utils/dateIsToday';
import fetchApi from '../../utils/fetchApi';
import getLetterStatuses from '../../utils/getLetterStatuses';
import getRandomElement from '../../utils/getRandomElement';
import makeUnique from '../../utils/makeUnique';

import './style.scss';

interface Props {
  colourBlindMode: boolean;
  darkMode: boolean;
  hardMode: boolean;
  onClearToasts: OnClearToasts;
  onConesMode: () => void;
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
  realWords: boolean;
  selectedLetterIndex: number | null;
  shake: boolean;
  status: 'lost' | 'playing' | 'revealing' | 'won';
  word: string;
  words: Letter[][];
}

const LS_KEY = 'game';
const MAX_BOARD_HEIGHT = 396;
const NUM_WORDS = 6;
const WIN_WORDS = ['Genius', 'Magnificent' ,'Impressive', 'Splendid', 'Great', 'Phew'];

const ORDINAL_RULES = new Intl.PluralRules('en', {
  type: 'ordinal'
});
const ORDINAL_SUFFIXES = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th'
};

type PersistedGame = Pick<State, 'absentLetters' | 'activeWordIndex' | 'correctLetters' | 'presentLetters' | 'status' | 'words'> & {
  short: string;
  timestamp: string;
};

export default class PlayPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const savedGame = localStorage.getItem(LS_KEY);
    let parsedSavedGame: Partial<PersistedGame> = {};
    let useSavedGame = false;

    try {
      parsedSavedGame = savedGame && JSON.parse(savedGame);
      useSavedGame = (parsedSavedGame && parsedSavedGame.short === this.short && dateIsToday(new Date(parsedSavedGame.timestamp as string))) ?? false;
    } catch {
      // swallow
    }

    this.state = {
      absentLetters: [],
      activeWordIndex: 0,
      boardHeight: MAX_BOARD_HEIGHT,
      boardWidth: 330,
      correctLetters: {},
      goHome: false,
      loading: true,
      modalOpen: false,
      presentLetters: [],
      realWords: false,
      selectedLetterIndex: null,
      shake: false,
      status: 'playing',
      word: '',
      words: new Array(NUM_WORDS).fill([]),
      ...useSavedGame && parsedSavedGame
    };

    this.handleBackspace = this.handleBackspace.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleLetter = this.handleLetter.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleShare = this.handleShare.bind(this);
  }

  get locked() {
    return this.state.status !== 'playing';
  }

  get short() {
    return window.location.pathname.slice(1);
  }

  async componentDidMount() {
    const response = await fetchApi('GET', `words/${this.short}`);
    if (!response.ok) {
      this.setState({
        loading: false
      });
      return;
    }

    const { realWords, word } = await response.json();
    this.setState({
      loading: false,
      realWords,
      word
    });

    window.addEventListener('resize', this.handleResize);
    this.handleResize();

    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('keydown', this.handleKeyDown);
    this.props.onClearToasts();
  }

  handleBackspace() {
    if (this.locked) {
      return;
    }

    const { activeWordIndex, selectedLetterIndex, words } = this.state;
    const word = words[activeWordIndex];
    if (word.length === 0) {
      return;
    }

    if (selectedLetterIndex !== null) {
      const clonedWords = cloneDeep(words);
      clonedWords[activeWordIndex].splice(selectedLetterIndex, 1);

      this.setState({
        selectedLetterIndex: null,
        words: clonedWords
      });
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

    const { hardMode } = this.props;
    const { absentLetters, activeWordIndex, correctLetters, presentLetters, realWords, word, words } = this.state;
    const guess = words[activeWordIndex];
    const guessString = guess.join('');
    if (guess.length !== word.length) {
      this.props.onToast('Not enough letters');
      shake();
      return;
    }

    if (guess.includes(' ')) {
      this.props.onToast('Must fill in blanks');
      shake();
      return;
    }

    if (realWords && !includes(guessString)) {
      this.props.onToast('Not in word list');
      shake();
      return;
    }

    if (hardMode) {
      const missingCorrectEntry = Object.entries(correctLetters).find(([index, letter]) => guess[parseInt(index, 0)] !== letter);
      if (missingCorrectEntry) {
        const position = parseInt(missingCorrectEntry[0], 10) + 1;
        const ordinal = ORDINAL_SUFFIXES[ORDINAL_RULES.select(position) as keyof typeof ORDINAL_SUFFIXES];
        this.props.onToast(`${position}${ordinal} letter must be a ${missingCorrectEntry[1]?.toUpperCase()}`);
        shake();
        return;
      }

      const missingPresentLetter = presentLetters.find((letter) => !guess.includes(letter));
      if (missingPresentLetter) {
        this.props.onToast(`Guess must contain ${missingPresentLetter.toUpperCase()}`);
        shake();
        return;
      }
    }

    if (guessString === 'cones' && activeWordIndex === 0) {
      this.props.onConesMode();
    }

    this.setState({
      status: 'revealing'
    });
    const absent = new Set<Letter>();
    const correct: Record<number, Letter> = {};
    const present = new Set<Letter>();
    for (let i = 0; i < word.length; i++) {
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
    const didWin = Object.keys(newCorrectLetters).length === word.length;
    const newActiveWordIndex = (isDone || didWin) ? activeWordIndex : activeWordIndex + 1;
    this.setState({
      absentLetters: makeUnique([...absent, ...absentLetters]),
      activeWordIndex: newActiveWordIndex,
      correctLetters: newCorrectLetters,
      presentLetters: makeUnique([...present, ...presentLetters]),
      selectedLetterIndex: null
    });
    if (didWin) {
      this.setState({
        status: 'won'
      }, () => this.persist());

      setTimeout(() => {
        this.props.onToast(getRandomElement(WIN_WORDS), 2000);
      }, 500 * word.length);
    } else if (isDone) {
      this.setState({
        status: 'lost'
      }, () => this.persist());

      setTimeout(() => {
        this.props.onToast(word.toUpperCase(), null);
      }, 500 * word.length);
    } else {
      this.persist();

      setTimeout(() => {
        this.setState({
          status: 'playing'
        });
      }, 500 * word.length);
    }

    if (didWin || isDone) {
      setTimeout(() => {
        this.setState({
          modalOpen: true
        });
      }, 500 * word.length + 2000);
    }
  }

  handleKeyDown({ key }: KeyboardEvent) {
    const { activeWordIndex, selectedLetterIndex, words } = this.state;
    const word = words[activeWordIndex];

    if (word.length === 0) {
      return;
    }

    if (key === 'ArrowLeft') {
      this.setState({
        selectedLetterIndex: (selectedLetterIndex === null || selectedLetterIndex === 0) ? word.length - 1 : selectedLetterIndex - 1
      });
    } else if (key === 'ArrowRight') {
      this.setState({
        selectedLetterIndex: (selectedLetterIndex === null || selectedLetterIndex === word.length - 1) ? 0 : selectedLetterIndex + 1
      });
    }
  }

  handleLetter(letter: Letter) {
    if (this.locked) {
      return;
    }

    const { activeWordIndex, selectedLetterIndex, word, words } = this.state;
    const guess = words[activeWordIndex];
    if (selectedLetterIndex !== null) {
      const clonedWords = [...words];
      clonedWords[activeWordIndex][selectedLetterIndex] = letter;


      this.setState({
        selectedLetterIndex: null,
        words: clonedWords
      });
      return;
    }

    if (guess.length === word.length) {
      const blankIndex = guess.indexOf(' ');
      if (blankIndex !== -1) {
        const clonedWords = [...words];
        clonedWords[activeWordIndex][blankIndex] = letter;

        this.setState({
          words: clonedWords
        });
      }
      return;
    }

    const clonedWords = [...words];
    clonedWords[activeWordIndex] = [...guess, letter];

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
    const { word: { length } } = this.state;
    const boardWidth = Math.min(Math.floor(Math.min(window.innerHeight * 0.55, window.innerWidth * 0.8) * (length / 6)) - 70, 66 * length);
    const boardHeight = 6 * Math.floor(boardWidth / length);
    this.setState({
      boardHeight,
      boardWidth
    });
  }

  async handleShare() {
    const { colourBlindMode, darkMode, hardMode } = this.props;
    const { absentLetters, activeWordIndex, correctLetters, presentLetters, status, word: actualWord, words } = this.state;
    const row = status === 'won' ? activeWordIndex + 1 : 'X';
    const emojis = words.slice(0, activeWordIndex + 1).map((word) => {
      const normalisedLettersSortedByStatus = getLetterStatuses(actualWord, word, (letter, index) => {
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
      });

      return normalisedLettersSortedByStatus.map(({ status }) => {
        if (status === 'absent') {
          return darkMode ? '⬛' : '⬜️';
        }

        if (status === 'correct') {
          return colourBlindMode ? '🟧' : '🟩';
        }

        if (status === 'present') {
          return colourBlindMode ? '🟦' : '🟨';
        }

        return '😳';
      }).join('');
    }).join('\n');
    const text = `Wordle (but you pick the word) ${this.short} ${row}/${NUM_WORDS}${hardMode ? '*' : ''}\n\n${emojis}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    try {
      if (isMobile && navigator.share) {
        await navigator.share({
          text
        });
      } else {
        await navigator.clipboard.writeText(text);
        this.props.onToast('Copied results to clipboard', 2000);
        }
    } catch {
      this.props.onToast('I\'m afraid I can\'t do that, Dave', 2000);
    }
  }

  persist() {
    const { absentLetters, activeWordIndex, correctLetters, presentLetters, status, words } = this.state;
    const game: PersistedGame = {
      absentLetters,
      activeWordIndex,
      correctLetters,
      presentLetters,
      short: this.short,
      status: status === 'revealing' ? 'playing' : status,
      timestamp: new Date().toJSON(),
      words
    };
    localStorage.setItem(LS_KEY, JSON.stringify(game));
  }

  render() {
    const {
      absentLetters,
      activeWordIndex,
      boardHeight,
      boardWidth,
      correctLetters,
      goHome,
      loading,
      modalOpen,
      presentLetters,
      realWords,
      selectedLetterIndex,
      shake,
      status,
      word: actualWord,
      words
    } = this.state;

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
        <div className="tiles">
          <div className="innerWrapper" style={{ height: boardHeight, width: boardWidth }}>
            {words.map((word, index) => {
              const active = activeWordIndex === index;
              const won = status === 'won';
              return (
                <TileRow
                  absentLetters={absentLetters}
                  active={active && status === 'playing'}
                  actualWord={actualWord}
                  correctLetters={correctLetters}
                  done={(won || status === 'lost') && active}
                  key={index}
                  numLetters={actualWord.length}
                  onTileClick={(selectedLetterIndex) => {
                    if (typeof words[activeWordIndex][selectedLetterIndex] !== 'undefined') {
                      this.setState({
                        selectedLetterIndex: selectedLetterIndex === this.state.selectedLetterIndex ? null : selectedLetterIndex
                      });
                    }
                  }}
                  presentLetters={presentLetters}
                  selectedLetterIndex={active && selectedLetterIndex !== null ? selectedLetterIndex : undefined}
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
          numLetters={actualWord.length}
          onBackspace={this.handleBackspace}
          onEnter={this.handleEnter}
          onLetter={this.handleLetter}
          presentLetters={presentLetters}
          secrets={[['whatistheword', () => this.props.onToast(`Shh, the word is "${actualWord}"`)]]}
          showSpace={true}
          spaceText={`Real Words: ${realWords ? 'On' : 'Off'}`}
        />
        <Modal
          ariaHideApp={false}
          isOpen={modalOpen}
          onRequestClose={this.handleModalClose}
          style={{
            content: {
              background: 'var(--bg-colour)',
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
            <div>A website by <a href="https://deanlevinson.com.au" rel="noreferrer" target="_blank">Dean Levinson</a></div>
            <button onClick={() => this.setState({ goHome: true })}>
              CHOOSE YOUR OWN
            </button>
            <button onClick={this.handleShare}>
              SHARE
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path fill="var(--text-colour-light)" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"></path>
              </svg>
            </button>
          </div>
        </Modal>
      </div>
    );
  }
}
