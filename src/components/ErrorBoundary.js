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
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>Une erreur est survenue</h2>
            <p>Une erreur inattendue s'est produite lors du chargement de cette page.</p>
            <details style={{ marginTop: '20px', textAlign: 'left', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <summary>Détails de l'erreur</summary>
              <p style={{ marginTop: '10px', fontFamily: 'monospace', color: '#d63384' }}>
                {this.state.error && this.state.error.toString()}
              </p>
              <pre style={{ marginTop: '10px', fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
