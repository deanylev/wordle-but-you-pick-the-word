import { Component, Ref, forwardRef } from 'react';

import { Letter } from '../Keyboard';

import './style.scss';

export type Status = 'absent' | 'correct' | 'present';

interface Props {
  bounce?: boolean;
  clickable: boolean;
  index: number;
  innerRef: Ref<HTMLButtonElement>;
  letter: Letter | null;
  numLetters: number;
  onClick: () => void;
  selected: boolean;
  status?: Status;
}

interface State {
  animation: 'bounce' | 'flipIn' | 'flipOut' | 'zoom' | null;
  status: Status | null;
}

class Tile extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      animation: null,
      status: this.props.status ?? null
    };
  }

  componentDidUpdate(prevProps: Props) {
    const iphone = navigator.platform === 'iPhone';

    if ((!prevProps.letter && this.props.letter) || (prevProps.letter === ' ' && this.props.letter && this.props.letter !== ' ')) {
      if (!iphone) {
        this.setState({
          animation: 'zoom'
        });
        setTimeout(() => {
          this.setState({
            animation: null
          });
        }, 40);
      }
    } else if (!prevProps.status && this.props.status) {
      setTimeout(() => {
        this.setState({
          animation: iphone ? null : 'flipIn'
        });
        setTimeout(() => {
          this.setState({
            animation: iphone ? null : 'flipOut',
          });
          setTimeout(() => {
            this.setState({
              animation: null,
              status: this.props.status ?? null
            });
          }, 250);
        }, 250);
      }, this.props.index * 300);
    }

    if (!prevProps.bounce && this.props.bounce) {
      setTimeout(() => {
        this.setState({
          animation: 'bounce'
        });
        setTimeout(() => {
          this.setState({
            animation: null
          });
        }, 1000);
      }, 500 * this.props.numLetters + this.props.index * 100);
    }
  }

  render() {
    const { clickable, innerRef, letter, onClick, selected } = this.props;
    const { animation, status } = this.state;
    return (
      <button
        className={`Tile ${status ?? (letter ? 'pending' : 'empty')} ${animation ?? ''} ${selected ? 'selected' : ''} ${clickable && letter ? 'clickable' : ''}`}
        onClick={onClick}
        onMouseDown={(event) => event.preventDefault()}
        ref={innerRef}
      >
        {letter ?? ''}
      </button>
    );
  }
}

export default forwardRef((props: Omit<Props, 'innerRef'>, ref: Ref<HTMLButtonElement>) => <Tile innerRef={ref} {...props} />)
