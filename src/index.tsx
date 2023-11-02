/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { Fragment, ReactNode } from 'react';
import { App } from './App';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './common/stores/store';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { ScrollToTop } from '$app/components/ScrollToTop';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createRoot } from 'react-dom/client';

import './resources/css/app.css';
import en from './resources/lang/en/en.json';
import { GoogleOAuthProvider } from '@react-oauth/google';

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

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_URL as unknown as string,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

const container = document.getElementById('root') as HTMLElement;

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleOAuth = (props: { children: ReactNode }) => {
  return import.meta.env.VITE_IS_HOSTED === 'true' ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {props.children}
    </GoogleOAuthProvider>
  ) : (
    <Fragment>{props.children}</Fragment>
  );
};

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
