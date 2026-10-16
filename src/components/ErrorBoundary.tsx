import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches unexpected errors while rendering and shows a friendly screen
 * instead of a blank page or technical details.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Only visible in development; production builds remove console calls.
    console.error(error, info);
  }

  private readonly reload = () => {
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="page page--narrow">
          <div className="card text-center">
            <h1>Algo salió mal</h1>
            <p>Ocurrió un problema al mostrar esta página. Intenta de nuevo.</p>
            <button type="button" className="btn btn--primary" onClick={this.reload}>
              Volver al inicio
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
