import { Component } from 'react';

import { BodyClassName } from 'react-html-body-classname'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

import Settings from './components/Settings';
import SideNav from './components/SideNav';
import CreatePage from './pages/CreatePage';
import PlayPage from './pages/PlayPage';

import './App.scss';
import Toaster from './components/Toaster';

interface Props {}

interface State {
  conesMode: boolean;
  showSideNav: boolean;
  showSettings: boolean;
}

export default class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      conesMode: false,
      showSideNav: false,
      showSettings: false
    };
  }

  render() {
    const { conesMode, showSideNav, showSettings } = this.state;
    return (
      <BrowserRouter>
        <div className="App">
          <div className="header">
            <button onClick={() => this.setState({ showSideNav: !showSideNav })}>
              <svg width="21" height="17" viewBox="0 0 21 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.172974" width="20" height="3" rx="1.5" fill="var(--text-colour)"></rect>
                <rect x="0.172974" y="7" width="20" height="3" rx="1.5" fill="var(--text-colour)"></rect>
                <rect x="0.172974" y="14" width="20" height="3" rx="1.5" fill="var(--text-colour)"></rect>
              </svg>
            </button>
            <Link className="title" onMouseDown={(event) => event.preventDefault()} to="">{conesMode ? 'Weedle' : 'Wordle'}</Link>
            {conesMode && (
              <button className="boof" onClick={() => this.setState({ conesMode: false })}>
                <img alt="boof" src="/images/boof.png" />
              </button>
            )}
            <button onClick={() => this.setState({ showSettings: true })}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path fill="var(--text-colour)" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"></path>
              </svg>
            </button>
          </div>
          <SideNav onClose={() => this.setState({ showSideNav: false })} show={showSideNav} />
          <div className="page">
            <Toaster>
              {(onToast, onClearToasts) => (
                <Settings onClose={() => this.setState({ showSettings: false })} onToast={onToast} show={showSettings}>
                  {(hardMode, darkMode, colourBlindMode, deanMode) => (
                    <>
                      <BodyClassName
                        className={`${darkMode ? '' : 'lightMode'} ${colourBlindMode ? 'colourBlindMode' : ''} ${deanMode ? 'deanMode' : ''} ${conesMode ? 'conesMode' : ''}`}
                        id="darkMode"
                      />
                      <Routes>
                        <Route
                          element={<CreatePage onToast={onToast} />}
                          path="/"
                        />
                        <Route
                          element={(
                            <PlayPage
                              colourBlindMode={colourBlindMode}
                              darkMode={darkMode}
                              hardMode={hardMode}
                              onClearToasts={onClearToasts}
                              onConesMode={() => this.setState({ conesMode: true })}
                              onToast={onToast}
                            />
                          )}
                          path="/:short"
                        />
                      </Routes>
                    </>
                  )}
                </Settings>
              )}
            </Toaster>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}
