import { Component } from 'react';
import QuizStatusView from './QuizStatusView';
import { resolveQuizErrorState } from '../utils/resolveQuizErrorState';

export default class QuizErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Quiz UI crashed:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.error) {
      const errorState = resolveQuizErrorState(this.state.error, this.props.fallbackState);

      return (
        <QuizStatusView
          state={errorState}
          actions={[
            { label: 'Try Again', onClick: this.handleRetry },
            { label: 'Reload', onClick: () => window.location.reload(), tone: 'secondary' },
          ]}
        />
      );
    }

    return this.props.children;
  }
}
