import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { printSignature } from "./lib/signature.ts";
import "./index.css";

printSignature();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
