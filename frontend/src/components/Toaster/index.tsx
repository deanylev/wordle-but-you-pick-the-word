import { Component, ReactNode } from 'react';

import './style.scss';

interface Toast {
  hidden: boolean;
  indefinite: boolean;
  message: string;
}

export type OnClearToasts = typeof Toaster.prototype.handleClearToasts;
export type OnToast = typeof Toaster.prototype.handleToast;

interface Props {
  children: (onToast: OnToast, onClearToasts: OnClearToasts) => ReactNode;
}

interface State {
  toasts: Record<string, Toast>;
}

export default class Toaster extends Component<Props, State> {
  queue = Promise.resolve();

  constructor(props: Props) {
    super(props);

    this.state = {
      toasts: {}
    };

    this.handleClearToasts = this.handleClearToasts.bind(this);
    this.handleToast = this.handleToast.bind(this);
  }

  handleClearToasts() {
    this.setState({
      toasts: {}
    });
  }

  async handleToast(message: string, timeout: number | null = 1000) {
    const id = (Date.now() * Math.random()).toFixed(0);
    this.queue = this.queue.then(() => new Promise<void>((resolve) => this.setState({
      toasts: {
        ...this.state.toasts,
        [id]: {
          hidden: false,
          indefinite: timeout === null,
          message
        }
      }
    }, resolve)));
    if (timeout !== null) {
      setTimeout(() => {
        this.queue = this.queue.then(() => new Promise<void>((resolve) => this.setState({
          toasts: {
            ...this.state.toasts,
            [id]: {
              ...this.state.toasts[id],
              hidden: true
            }
          }
        }, resolve)));
        setTimeout(() => {
          this.queue = this.queue.then(() => new Promise<void>((resolve) => this.setState({
            toasts: Object.fromEntries(Object.entries(this.state.toasts).filter(([key]) => key !== id))
          }, resolve)));
        }, 300);
      }, timeout);
    }
  }

  render() {
    return (
      <div className="Toaster">
        <div className="toasts">
          {Object.entries(this.state.toasts).map(([id, { hidden, indefinite, message }], ) => (
            <div className={`${hidden ? 'hidden' : ''} ${indefinite ? '' : 'transient'}`} key={id}>
              {message}
            </div>
          ))}
        </div>
        {this.props.children(this.handleToast, this.handleClearToasts)}
      </div>
    );
  }
}
