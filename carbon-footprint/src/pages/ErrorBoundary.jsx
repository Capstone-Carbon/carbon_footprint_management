import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <h2>차트 로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</h2>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
