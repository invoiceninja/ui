/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  useReactSettings,
  useSaveReactSettings,
} from '$app/common/hooks/useReactSettings';
import { useCallback } from 'react';

export type InvoiceEditorSection =
  | 'meta_secondary'
  | 'terms'
  | 'footer'
  | 'notes'
  | 'tax_discount';

interface UseInvoiceEditorPreferences {
  isExpanded: (section: InvoiceEditorSection, autoOpen?: boolean) => boolean;
  setExpanded: (section: InvoiceEditorSection, value: boolean) => void;
  toggle: (section: InvoiceEditorSection, autoOpen?: boolean) => void;
  isPromoted: (section: InvoiceEditorSection) => boolean;
  promote: (section: InvoiceEditorSection) => void;
}

export function useInvoiceEditorPreferences(): UseInvoiceEditorPreferences {
  const reactSettings = useReactSettings();
  const save = useSaveReactSettings();

  const stored = reactSettings.invoice_editor?.expanded_sections ?? {};
  const promoted = reactSettings.invoice_editor?.promoted_sections ?? {};

  const isExpanded = useCallback(
    (section: InvoiceEditorSection, autoOpen?: boolean) => {
      if (Object.prototype.hasOwnProperty.call(stored, section)) {
        return Boolean(stored[section]);
      }

      return Boolean(autoOpen);
    },
    [stored]
  );

  const setExpanded = useCallback(
    (section: InvoiceEditorSection, value: boolean) => {
      save(`invoice_editor.expanded_sections.${section}`, value);
    },
    [save]
  );

  const toggle = useCallback(
    (section: InvoiceEditorSection, autoOpen?: boolean) => {
      setExpanded(section, !isExpanded(section, autoOpen));
    },
    [isExpanded, setExpanded]
  );

  const isPromoted = useCallback(
    (section: InvoiceEditorSection) => Boolean(promoted[section]),
    [promoted]
  );

  const promote = useCallback(
    (section: InvoiceEditorSection) => {
      if (promoted[section]) return;
      save(`invoice_editor.promoted_sections.${section}`, true);
    },
    [promoted, save]
  );

  return { isExpanded, setExpanded, toggle, isPromoted, promote };
}
