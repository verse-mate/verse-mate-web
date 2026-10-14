import "../product-setup";
import { createRoot } from "react-dom/client";
import { PrototypeApp } from "./app";

const DIR = "../../prototype-pages";
const root = document.getElementById("root");
if (root) createRoot(root).render(<PrototypeApp dir={DIR} pages={import.meta.glob(["../../prototype-pages/**/*.tsx", "../../prototype-pages/**/*.jsx"])} />);
