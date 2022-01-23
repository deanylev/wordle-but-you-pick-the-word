import { Component } from 'react';

import { Letter } from '../Keyboard';

import './style.scss';

export type Status = 'absent' | 'correct' | 'present';

interface Props {
  bounce?: boolean;
  index: number;
  letter: Letter | null;
  status?: Status;
}

interface State {
  animation: 'bounce' | 'flipIn' | 'flipOut' | 'zoom' | null;
  status: Status | null;
}

export default class Tile extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      animation: null,
      status: this.props.status ?? null
    };
  }

  componentDidUpdate(prevProps: Props) {
    const iphone = navigator.platform === 'iPhone';

    if (!prevProps.letter && this.props.letter) {
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
      }, 500 * 5 + this.props.index * 100);
    }
  }

  render() {
    const { letter } = this.props;
    const { animation, status } = this.state;
    return (
      <div className={`Tile ${status ?? (letter ? 'pending' : 'empty')} ${animation ?? ''}`}>
        {letter ?? ''}
      </div>
    );
  }
}
