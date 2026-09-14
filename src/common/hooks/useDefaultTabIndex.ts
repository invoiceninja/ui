/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_TAB,
  DEFAULT_TABS,
  DefaultTab,
} from '../constants/default-tab';
import { Invoice } from '../interfaces/invoice';
import { InvoiceItem, InvoiceItemType } from '../interfaces/invoice-item';
import { Quote } from '../interfaces/quote';
import { RecurringInvoice } from '../interfaces/recurring-invoice';
import { useReactSettings } from './useReactSettings';

type Resource = Invoice | Quote | RecurringInvoice;

const resolveDominantTab = (lineItems: InvoiceItem[]): DefaultTab | null => {
  const tasks = lineItems.filter(
    (lineItem) => lineItem.type_id === InvoiceItemType.Task
  ).length;
  const products = lineItems.length - tasks;

  if (tasks === products) {
    return null;
  }

  return tasks > products ? 'tasks' : 'products';
};

export const useDefaultTabIndex = (resource: Resource | undefined) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const reactSettings = useReactSettings();

  const dominantTab = useMemo(
    () => resolveDominantTab(resource?.line_items ?? []),
    [resource?.id]
  );

  const defaultTab = reactSettings.preferences?.default_tab ?? DEFAULT_TAB;
  const currentTab = searchParams.get('table') ?? dominantTab ?? defaultTab;
  const currentTabIndex = DEFAULT_TABS.findIndex((tab) => tab === currentTab);

  const handleTabChange = (index: number) => {
    const tab = DEFAULT_TABS[index];

    if (!tab) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set('table', tab);

    setSearchParams(params, { replace: true });
  };

  return {
    defaultTabIndex: currentTabIndex === -1 ? 0 : currentTabIndex,
    handleTabChange,
  };
};
