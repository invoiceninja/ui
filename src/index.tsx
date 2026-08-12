/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18n from 'i18next';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { ScrollToTop } from '$app/components/ScrollToTop';
import { App } from './App';
import { initializeSentry } from './common/sentry';
import { store } from './common/stores/store';

import './resources/css/app.css';

import { loader } from '@monaco-editor/react';
import mitt from 'mitt';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { Events } from './common/events';
import { GoogleOAuth } from './components/GoogleOAuth';
import { ReactQueryDevtoolsPanel } from './components/ReactQueryDevtoolsPanel';
import en from './resources/lang/en/en.json';

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
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
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

async function bootstrap() {
  try {
    await initializeSentry();
  } catch (error) {
    console.error('Sentry initialization failed.', error);
  }

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
        <ReactQueryDevtoolsPanel />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

void bootstrap();

export const emitter = mitt<Events>();
