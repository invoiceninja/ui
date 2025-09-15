/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { HistoryState } from '@lexical/react/LexicalHistoryPlugin';
import type { JSX } from 'react';

import { createEmptyHistoryState } from '@lexical/react/LexicalHistoryPlugin';
import * as React from 'react';
import { createContext, ReactNode, useContext, useMemo } from 'react';

type ContextShape = {
  historyState?: HistoryState;
};

const Context: React.Context<ContextShape> = createContext({});

export const SharedHistoryContext = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const historyContext = useMemo(
    () => ({ historyState: createEmptyHistoryState() }),
    []
  );
  return <Context.Provider value={historyContext}>{children}</Context.Provider>;
};

export const useSharedHistoryContext = (): ContextShape => {
  return useContext(Context);
};
