import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Prototype stylesheet from the Claude Design handoff. Loaded AFTER
// index.css so its `:root` tokens (--bg-reading, --fg-primary, --vm-dust,
// etc.) and its class rules (.app-shell, .sidebar, .book-row, .pill,
// .commentary-h2, .audio-entry, …) become the canonical visual spec.
// A `.dark { … }` block at the end of the file flips the same tokens to
// their dark equivalents when AppContext sets <html class="dark">.
import "./styles/prototype.css";

createRoot(document.getElementById("root")!).render(<App />);
