import { Component } from "react";
import { CircleAlert } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error no controlado en la interfaz:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="fatal-error">
          <div className="fatal-error__card">
            <span className="fatal-error__icon" aria-hidden="true">
              <CircleAlert size={30} />
            </span>
            <p className="eyebrow">Algo salió mal</p>
            <h1>No pudimos mostrar esta página</h1>
            <p>
              Recarga la página para intentarlo de nuevo. Si el problema
              continúa, escríbenos y lo revisamos.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
