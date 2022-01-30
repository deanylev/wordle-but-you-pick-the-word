import { Component, ReactNode } from 'react';

import Switch from '../Switch';
import { OnToast } from '../Toaster';

import './style.scss';

interface Props {
  children: (hardMode: boolean) => ReactNode;
  onClose: () => void;
  onToast: OnToast;
  show: boolean;
}

interface State {
  animation: 'slideIn' | 'slideOut' | null;
  hardMode: boolean;
  show: boolean;
}

const LS_KEY = 'settings';

export default class Settings extends Component<Props, State> {
  animationTimeout: number | null = null;

  constructor(props: Props) {
    super(props);

    const savedSettings = localStorage.getItem(LS_KEY);
    let parsedSavedSettings: Record<string, unknown> = {};

    try {
      parsedSavedSettings = savedSettings && JSON.parse(savedSettings);
    } catch {
      // swallow
    }

    this.state = {
      animation: null,
      hardMode: false,
      show: this.props.show,
      ...parsedSavedSettings
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (!prevProps.show && this.props.show) {
      if (this.animationTimeout !== null) {
        clearTimeout(this.animationTimeout);
        this.animationTimeout = null;
      }

      this.setState({
        animation: 'slideIn',
        show: true
      });
      this.animationTimeout = window.setTimeout(() => {
        this.animationTimeout = null;
        this.setState({
          animation: null
        });
      }, 200);
    } else if (prevProps.show && !this.props.show) {
      if (this.animationTimeout !== null) {
        clearTimeout(this.animationTimeout);
        this.animationTimeout = null;
      }

      this.setState({
        animation: 'slideOut'
      });
      this.animationTimeout = window.setTimeout(() => {
        this.animationTimeout = null;
        this.setState({
          animation: null,
          show: false
        });
      }, 200);
    }

    if (prevState.hardMode !== this.state.hardMode) {
      this.persist();
    }
  }

  persist() {
    const { hardMode } = this.state;
    localStorage.setItem(LS_KEY, JSON.stringify({
      hardMode
    }));
  }

  render() {
    const { children, onClose, onToast } = this.props;
    const { animation, hardMode, show } = this.state;

    return (
      <>
        {show && (
          <div className={`Settings ${animation ?? ''}`}>
            <div>
              <div className="header">
                <div className="spacer"></div>
                <div>SETTINGS</div>
                <button onClick={onClose}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path fill="#565758" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                  </svg>
                </button>
              </div>
              <div className="options">
                <div>
                  <div>
                    <div className="title">Hard Mode</div>
                    <div className="hint">Any revealed hints must be used in subsequent guesses</div>
                  </div>
                  <Switch onChange={(newValue) => this.setState({ hardMode: newValue })} value={hardMode} />
                </div>
                <div>
                  <div>
                    <div className="title">Dark Theme</div>
                  </div>
                  <Switch onChange={() => onToast('lol no')} value={true} />
                </div>
              </div>
            </div>
            <div className="footer">
              <a href="https://github.com/deanylev/wordle-but-you-pick-the-word" rel="noreferrer" target="_blank">Source</a>
              <span>Made by <a href="https://deanlevinson.com.au" rel="noreferrer" target="_blank">Dean Levinson</a></span>
            </div>
          </div>
        )}
        {children(hardMode)}
      </>
    );
  }
}
