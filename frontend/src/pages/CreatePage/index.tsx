import { Component } from 'react';

import { Navigate } from 'react-router-dom';

import Keyboard, { Letter } from '../../components/Keyboard';
import TileRow from '../../components/TileRow';
import { OnToast } from '../../components/Toaster';
import wordList from '../../globals/wordList';
import fetchApi from '../../utils/fetchApi';

import './style.scss';

interface Props {
  onToast: OnToast;
}

interface State {
  realWords: boolean;
  shake: boolean;
  short: string | null;
  word: Letter[];
}

const WORD_LENGTH = 5;

export default class CreatePage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      realWords: false,
      shake: false,
      short: null,
      word: []
    };

    this.handleBackspace = this.handleBackspace.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.handleLetter = this.handleLetter.bind(this);
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

    const { realWords, word } = this.state;
    if (word.length !== WORD_LENGTH) {
      this.props.onToast('Not enough letters');
      shake();
      return;
    }

    const joinedWord = word.join('');
    if (realWords && !wordList.includes(joinedWord)) {
      this.props.onToast('Not in word list');
      shake();
      return;
    }

    const response = await fetchApi('POST', 'words', {
      realWords,
      word: joinedWord
    });
    const { short } = await response.json();
    this.setState({
      short
    });
  }

  handleLetter(letter: Letter) {
    const { word } = this.state;
    if (word.length === WORD_LENGTH) {
      return;
    }

    this.setState({
      word: [...word, letter]
    });
  }

  render() {
    const { realWords, shake, short, word } = this.state;
    if (short) {
      return <Navigate to={`/${short}`} />
    }

    return (
      <div className="CreatePage">
        <div className="input">
          <div className="hint">Enter a Word With the Keyboard:</div>
          <div className="tiles">
            <TileRow shake={shake} word={word} />
          </div>
          <label>
            Restrict to Real Words?
            <input checked={realWords} onChange={() => this.setState({ realWords: !realWords })} type="checkbox" />
          </label>
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
