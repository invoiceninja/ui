/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./common/stores/store";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "./resources/css/app.css";

import en from "./resources/lang/en/en.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

const Router =
  import.meta.env.VITE_ROUTER === "hash" ? HashRouter : BrowserRouter;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
