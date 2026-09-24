/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { createContext, ReactNode, useContext, useMemo } from 'react';

export interface SettingsDocs {
  id: string;
  url: string;
  heading?: string;
}

interface SettingsDocsContextValue {
  docs: SettingsDocs;
  onDocsClick: (docs: SettingsDocs) => void;
}

const SettingsDocsContext = createContext<SettingsDocsContextValue | null>(
  null
);

interface ProviderProps {
  docs?: SettingsDocs;
  onDocsClick: (docs: SettingsDocs) => void;
  children: ReactNode;
}

export function SettingsDocsProvider({
  docs,
  onDocsClick,
  children,
}: ProviderProps) {
  const value = useMemo(() => {
    if (!docs) {
      return null;
    }

    return {
      docs,
      onDocsClick,
    };
  }, [docs, onDocsClick]);

  return (
    <SettingsDocsContext.Provider value={value}>
      {children}
    </SettingsDocsContext.Provider>
  );
}

export function useSettingsCardLearnMore(enabled: boolean) {
  const context = useContext(SettingsDocsContext);

  if (!context || !enabled) {
    return null;
  }

  return context;
}
