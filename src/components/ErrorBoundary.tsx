import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary. Without this, any exception thrown while rendering
 * tears down the entire React root and the user is left staring at the bare
 * midnight-navy <body> background — a silent "blue screen" with no clue what
 * went wrong. This catches the throw and shows the actual error + a reload,
 * so a broken render is diagnosable instead of invisible.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to the console so the stack is captured in dev tools / logs.
    console.error("[ErrorBoundary] Uncaught render error:", error, info);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "hsl(207 75% 10%)", // token: --midnight-deep
          color: "hsl(210 40% 96%)", // token: --foreground
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "32rem",
            width: "100%",
            background: "hsl(207 60% 14%)", // token: --card (approx surface)
            border: "1px solid hsl(193 100% 50% / 0.25)", // token: --cyan-glow
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          }}
        >
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              opacity: 0.75,
              lineHeight: 1.6,
              marginBottom: "1.25rem",
            }}
          >
            The page hit an unexpected error and couldn&rsquo;t finish loading.
            The details below show what happened.
          </p>

          <pre
            style={{
              fontSize: "0.8rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "hsl(207 75% 8%)", // token: --midnight-deep (darker inset)
              border: "1px solid hsl(210 40% 96% / 0.1)", // token: --foreground
              borderRadius: "0.5rem",
              padding: "0.85rem",
              marginBottom: "1.25rem",
              maxHeight: "12rem",
              overflow: "auto",
              color: "hsl(0 80% 78%)", // token: --destructive (soft error text)
            }}
          >
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ""}
          </pre>

          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: "hsl(193 100% 50%)", // token: --cyan-glow
              color: "hsl(207 75% 10%)", // token: --midnight-deep
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.7rem 1.4rem",
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
