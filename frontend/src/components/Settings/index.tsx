import { Component, ReactNode } from 'react';

import Switch from '../Switch';
import { OnToast } from '../Toaster';

import './style.scss';

interface Props {
  children: (hardMode: boolean, darkMode: boolean, colourBlindMode: boolean, deanMode: boolean) => ReactNode;
  onClose: () => void;
  onToast: OnToast;
  show: boolean;
}

interface State {
  animation: 'slideIn' | 'slideOut' | null;
  colourBlindMode: boolean;
  darkMode: boolean;
  deanMode: boolean;
  hardMode: boolean;
  show: boolean;
}

const LS_KEY = 'settings';
const SETTINGS: (keyof State)[] = ['colourBlindMode', 'darkMode', 'deanMode', 'hardMode'];

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
      colourBlindMode: false,
      darkMode: true,
      deanMode: false,
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

    if (SETTINGS.some((setting) => prevState[setting] !== this.state[setting])) {
      this.persist();
    }
  }

  persist() {
    const settings: Partial<Record<keyof State, unknown>> = {};
    SETTINGS.forEach((setting) => {
      settings[setting] = this.state[setting];
    });
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
  }

  render() {
    const { children, onClose } = this.props;
    const { animation, colourBlindMode, darkMode, deanMode, hardMode, show } = this.state;

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
                  <Switch onChange={(newValue) => this.setState({ darkMode: newValue })} value={darkMode} />
                </div>
                <div>
                  <div>
                    <div className="title">Color Blind Mode</div>
                    <div className="hint">High contrast colours</div>
                  </div>
                  <Switch onChange={(newValue) => this.setState({ colourBlindMode: newValue })} value={colourBlindMode} />
                </div>
                <div>
                  <div>
                    <div className="title">Dean Mode</div>
                    <div className="hint">🗿</div>
                  </div>
                  <Switch onChange={(newValue) => this.setState({ deanMode: newValue })} value={deanMode} />
                </div>
              </div>
            </div>
            <div className="footer">
              <a href="https://github.com/deanylev/wordle-but-you-pick-the-word" rel="noreferrer" target="_blank">Source</a>
              <span>Made by <a href="https://deanlevinson.com.au" rel="noreferrer" target="_blank">Dean Levinson</a></span>
            </div>
          </div>
        )}
        {children(hardMode, darkMode, colourBlindMode, deanMode)}
      </>
    );
  }
}
