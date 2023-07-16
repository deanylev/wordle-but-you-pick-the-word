import { Component, createRef } from 'react';

import './style.scss';

interface Props {
  onClose: () => void;
  show: boolean;
}

interface State {
  animation: 'slideLeft' | 'slideRight' | null;
  show: boolean;
}

const ANIMATION_TIMEOUT_MS = 150;

export default class SideNav extends Component<Props, State> {
  animationTimeout: number | null = null;
  elementRef = createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);

    this.state = {
      animation: null,
      show: this.props.show
    };

    this.handleBodyClick = this.handleBodyClick.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.show && this.props.show) {
      if (this.animationTimeout !== null) {
        clearTimeout(this.animationTimeout);
        this.animationTimeout = null;
      }

      this.setState({
        animation: 'slideRight',
        show: true
      });
      this.animationTimeout = window.setTimeout(() => {
        this.animationTimeout = null;
        this.setState({
          animation: null
        });

        document.body.addEventListener('click', this.handleBodyClick);
      }, ANIMATION_TIMEOUT_MS);
    } else if (prevProps.show && !this.props.show) {
      if (this.animationTimeout !== null) {
        clearTimeout(this.animationTimeout);
        this.animationTimeout = null;
      }

      document.body.removeEventListener('click', this.handleBodyClick);

      this.setState({
        animation: 'slideLeft'
      });
      this.animationTimeout = window.setTimeout(() => {
        this.animationTimeout = null;
        this.setState({
          animation: null,
          show: false
        });
      }, ANIMATION_TIMEOUT_MS);
    }
  }

  handleBodyClick(event: MouseEvent) {
    const { current } = this.elementRef;
    if (!current) {
      return;
    }

    if (!event.composedPath().includes(current)) {
      this.props.onClose();
    }
  }

  render() {
    const { onClose } = this.props;
    const { animation, show } = this.state;

    return (
      <>
        {show && (
          <div className={`SideNav ${animation ?? ''}`} ref={this.elementRef}>
            <div className="innerWrapper">
              <div className="header">
                <a href="https://deanlevinson.com.au" rel="noreferrer" target="_blank">Dean Levinson</a>
                <button onClick={onClose}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path fill="var(--text-colour)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                  </svg>
                </button>
              </div>
              <div className="subHeading">More Dean Levinson Websites</div>
            </div>
            <div className="websites">
              <a href="https://whatepisodeshouldiwatch.com" rel="noreferrer" target="_blank">
                <img alt="What Episode Should I Watch?" src="/images/whatepisodeshouldiwatch.ico" />
                What Episode Should I Watch?
              </a>
              <a href="https://geniusquotefinder.com" rel="noreferrer" target="_blank">
                <img alt="Genius Quote Finder" src="/images/geniusquotefinder.ico" />
                Genius Quote Finder
              </a>
              <a href="https://whosleepswhere.com" rel="noreferrer" target="_blank">
                <img alt="Who Sleeps Where?" src="/images/whosleepswhere.ico" />
                Who Sleeps Where?
              </a>
              <a href="https://improveyourmood.xyz" rel="noreferrer" target="_blank">
                <img alt="Improve Your Mood" src="/images/improveyourmood.ico" />
                Improve Your Mood
              </a>
              <a href="https://awesomemediadownloader.xyz" rel="noreferrer" target="_blank">
                <img alt="Awesome Media Downloader" src="/images/awesomemediadownloader.ico" />
                Awesome Media Downloader
              </a>
              <a href="https://deanlevinson.com.au/#/portfolio" rel="noreferrer" target="_blank">
                <div />
                All Projects
              </a>
            </div>
          </div>
        )}
      </>
    );
  }
}
