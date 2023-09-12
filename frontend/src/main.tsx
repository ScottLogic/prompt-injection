import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
