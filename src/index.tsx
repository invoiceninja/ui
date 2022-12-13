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
import { BrowserTracing } from '@sentry/tracing';
import { ScrollToTop } from 'components/ScrollToTop';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createRoot } from 'react-dom/client';

import './resources/css/app.css';
import * as LanguageResources from './resources/lang/index';

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      translation: LanguageResources.ar,
    },
    ca: {
      translation: LanguageResources.ca,
    },
    cs: {
      translation: LanguageResources.cs,
    },
    da: {
      translation: LanguageResources.da,
    },
    de: {
      translation: LanguageResources.de,
    },
    el: {
      translation: LanguageResources.el,
    },
    en: {
      translation: LanguageResources.en,
    },
    en_GB: {
      translation: LanguageResources.en_GB,
    },
    es: {
      translation: LanguageResources.es,
    },
    es_ES: {
      translation: LanguageResources.es_ES,
    },
    fa: {
      translation: LanguageResources.fa,
    },
    fi: {
      translation: LanguageResources.fi,
    },
    fr: {
      translation: LanguageResources.fr,
    },
    fr_CA: {
      translation: LanguageResources.fr_CA,
    },
    hr: {
      translation: LanguageResources.hr,
    },
    it: {
      translation: LanguageResources.it,
    },
    ja: {
      translation: LanguageResources.ja,
    },
    lt: {
      translation: LanguageResources.lt,
    },
    lv_LV: {
      translation: LanguageResources.lv_LV,
    },
    mk_MK: {
      translation: LanguageResources.mk_MK,
    },
    nb_NO: {
      translation: LanguageResources.nb_NO,
    },
    nl: {
      translation: LanguageResources.nl,
    },
    pl: {
      translation: LanguageResources.pl,
    },
    pt_BR: {
      translation: LanguageResources.pt_BR,
    },
    pt_PT: {
      translation: LanguageResources.pt_PT,
    },
    ro: {
      translation: LanguageResources.ro,
    },
    ru_RU: {
      translation: LanguageResources.ru_RU,
    },
    sl: {
      translation: LanguageResources.sl,
    },
    sq: {
      translation: LanguageResources.sq,
    },
    sv: {
      translation: LanguageResources.sv,
    },
    th: {
      translation: LanguageResources.th,
    },
    tr_TR: {
      translation: LanguageResources.tr_TR,
    },
    zh_TW: {
      translation: LanguageResources.zh_TW,
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

const queryClient = new QueryClient();

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_URL as unknown as string,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

const container = document.getElementById('root') as HTMLElement;

createRoot(container).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Router>
          <ScrollToTop>
            <App />
          </ScrollToTop>
        </Router>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
