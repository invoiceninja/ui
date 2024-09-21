/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';
import { App } from './App';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './common/stores/store';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { ScrollToTop } from '$app/components/ScrollToTop';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createRoot } from 'react-dom/client';

import './resources/css/app.css';
import en from './resources/lang/en/en.json';
import { GoogleOAuth } from './components/GoogleOAuth';
import mitt from 'mitt';
import { Events } from './common/events';

import { loader } from '@monaco-editor/react';

import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';2

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_URL as unknown as string,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

const Router =
  import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

loader.config({ monaco });

loader.init().then(/* ... */);

const container = document.getElementById('root') as HTMLElement;

createRoot(container).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <GoogleOAuth>
          <Router>
            <ScrollToTop>
              <App />
            </ScrollToTop>
          </Router>
        </GoogleOAuth>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);

export const emitter = mitt<Events>();
