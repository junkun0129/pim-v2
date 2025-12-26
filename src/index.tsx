import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router";
import { DataProvider } from "./components/providers/dataProvider";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DataProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DataProvider>
  </React.StrictMode>
);
