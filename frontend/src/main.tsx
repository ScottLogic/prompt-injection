import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { isNewUser } from "./service/userService";

async function main() {
  const newUser = await isNewUser();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <StrictMode>
      <App isNewUser={newUser} />
    </StrictMode>
  );
}

void main();
