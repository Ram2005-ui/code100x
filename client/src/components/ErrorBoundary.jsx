import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 m-10 bg-red-500/20 border border-red-500 rounded-lg text-white">
          <h2 className="text-2xl font-bold text-red-500 mb-4">React App Crashed!</h2>
          <div className="bg-black/50 p-4 rounded overflow-auto font-mono text-sm">
            <p className="text-red-400 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
            <pre className="text-white/70">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
