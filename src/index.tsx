import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router";
import { DataProvider } from "./components/providers/dataProvider";
import { ToastProvider } from "./components/providers/toastProvider";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <DataProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DataProvider>
    </ToastProvider>
  </React.StrictMode>
);
