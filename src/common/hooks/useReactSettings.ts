/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RootState } from '$app/common/stores/store';
import { useSelector } from 'react-redux';
import { useInjectUserChanges } from './useInjectUserChanges';
import { cloneDeep, merge } from 'lodash';
import { Record as ClientMapRecord } from '../constants/exports/client-map';
import { Entity } from '$app/components/CommonActionsPreferenceModal';
import { PerPage } from '$app/components/DataTable';

export type ChartsDefaultView = 'day' | 'week' | 'month';

export interface TableFiltersPreference {
  filter?: string;
  customFilter?: string[];
  currentPage: number;
  sort?: string;
  status: string[];
  sortedBy?: string;
  perPage?: PerPage;
}

export interface Preferences {
  dashboard_charts: {
    default_view: 'day' | 'week' | 'month';
    range: string;
    currency: number;
  };
  datatables: {
    clients: {
      sort: string;
    };
  };
  reports: {
    columns: Record<string, ClientMapRecord[][]>;
  };
}

type ImportTemplates = Record<string, Record<string, Record<number, string>>>;

export interface ReactSettings {
  show_pdf_preview: boolean;
  react_table_columns?: Record<ReactTableColumns, string[]>;
  react_notification_link: boolean;
  number_precision?: number;
  show_document_preview?: boolean;
  preferences: Preferences;
  table_filters?: Record<string, TableFiltersPreference>;
  common_actions?: Record<Entity, string[]>;
  show_mini_sidebar?: boolean;
  import_templates?: ImportTemplates;
  table_footer_columns?: Record<ReactTableColumns, string[]>;
  show_table_footer?: boolean;
  dark_mode?: boolean;
}

export type ReactTableColumns =
  | 'invoice'
  | 'client'
  | 'product'
  | 'recurringInvoice'
  | 'payment'
  | 'quote'
  | 'credit'
  | 'project'
  | 'task'
  | 'vendor'
  | 'purchaseOrder'
  | 'expense'
  | 'recurringExpense'
  | 'clientDocument'
  | 'transaction';

export const preferencesDefaults: Preferences = {
  dashboard_charts: {
    default_view: 'month',
    currency: 1,
    range: 'this_month',
  },
  datatables: {
    clients: {
      sort: 'id|desc',
    },
  },
  reports: {
    columns: {},
  },
};

interface Options {
  overwrite?: boolean;
}

export function useReactSettings(options?: Options) {
  const user = useInjectUserChanges({ overwrite: options?.overwrite });

  const reactSettings =
    useSelector(
      (state: RootState) => state.user.changes?.company_user?.react_settings
    ) || {};

  const previousReactTableColumns =
    user?.company_user?.settings?.react_table_columns;

  const settings: ReactSettings = {
    show_pdf_preview: true,
    react_notification_link: true,
    // This is legacy fallback for old settings location. If you see this in 2 years, feel free to remove it.
    react_table_columns: {
      ...previousReactTableColumns,
      ...reactSettings.react_table_columns,
    },
    preferences: cloneDeep(preferencesDefaults),
  };

  return merge<ReactSettings, ReactSettings>(
    { ...settings },
    { ...reactSettings }
  );
}
