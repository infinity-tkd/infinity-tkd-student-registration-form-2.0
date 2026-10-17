import { Component } from "react";
import { reliabilityCopy } from "../data/reliability";

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    window.dispatchEvent(new Event("infinity:save-draft"));
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const lang = document.documentElement.lang.split("-")[0];
    const copy = reliabilityCopy[lang] || reliabilityCopy.en;
    return (
      <main className="error-recovery">
        <h1>{copy.recoverError}</h1>
        <p>{copy.recoverErrorText}</p>
        <button
          type="button"
          className="button button-primary"
          onClick={() => window.location.reload()}
        >
          {copy.reload}
        </button>
      </main>
    );
  }
}
