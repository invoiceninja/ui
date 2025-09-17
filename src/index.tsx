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
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { LexicalComposer } from '@lexical/react/LexicalComposer';

import PlaygroundEditorTheme from './components/lexical/themes/PlaygroundEditorTheme';
import PlaygroundNodes from './components/lexical/nodes/PlaygroundNodes';
import { $isTextNode, DOMConversionMap, TextNode } from 'lexical';
import { parseAllowedColor } from './components/lexical/ui/ColorPicker';
import { parseAllowedFontSize } from './components/lexical/plugins/ToolbarPlugin/fontSize';
import { SharedHistoryContext } from './components/lexical/context/SharedHistoryContext';
import { TableContext } from './components/lexical/plugins/TablePlugin';
import { ToolbarContext } from './components/lexical/context/ToolbarContext';
import { FlashMessageContext } from './components/lexical/context/FlashMessageContext';

function getExtraStyles(element: HTMLElement): string {
  // Parse styles from pasted input, but only if they match exactly the
  // sort of styles that would be produced by exportDOM
  let extraStyles = '';
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const backgroundColor = parseAllowedColor(element.style.backgroundColor);
  const color = parseAllowedColor(element.style.color);
  if (fontSize !== '' && fontSize !== '15px') {
    extraStyles += `font-size: ${fontSize};`;
  }
  if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
    extraStyles += `background-color: ${backgroundColor};`;
  }
  if (color !== '' && color !== 'rgb(0, 0, 0)') {
    extraStyles += `color: ${color};`;
  }
  return extraStyles;
}

function buildImportMap(): DOMConversionMap {
  const importMap: DOMConversionMap = {};

  // Wrap all TextNode importers with a function that also imports
  // the custom styles implemented by the playground
  for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output === null ||
            output.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const { forChild } = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
}

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
  <FlashMessageContext>
    <LexicalComposer
      initialConfig={{
        editorState: null,
        html: { import: buildImportMap() },
        namespace: 'Playground',
        nodes: [...PlaygroundNodes],
        onError: (error: Error) => {
          throw error;
        },
        theme: PlaygroundEditorTheme,
      }}
    >
      <SharedHistoryContext>
        <TableContext>
          <ToolbarContext>
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
          </ToolbarContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  </FlashMessageContext>
);

export const emitter = mitt<Events>();
