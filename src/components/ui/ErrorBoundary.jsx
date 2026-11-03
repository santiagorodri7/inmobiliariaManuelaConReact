import { Component } from "react";
import { CircleAlert } from "lucide-react";
import { translate } from "../../i18n/translate.js";

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
            <p className="eyebrow">{translate("fatal.eyebrow")}</p>
            <h1>{translate("fatal.title")}</h1>
            <p>{translate("fatal.text")}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              {translate("fatal.reload")}
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
