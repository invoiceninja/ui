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
import { useDispatch, useSelector } from 'react-redux';
import { useCurrentUser } from './useCurrentUser';
import { updateChanges } from '$app/common/stores/slices/user';

export interface ReactSettings {
  show_pdf_preview: boolean;
  react_table_columns?: Record<ReactTableColumns, string[]>;
  react_notification_link: boolean;
  preferences: {
    dashboard_charts: {
      default_view: 'day' | 'week' | 'month';
    };
  };
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
  | 'recurringExpense';

type AutoCompleteKey<T, Prefix extends string = ''> = keyof T extends never
  ? Prefix
  : {
      [K in keyof T & string]: T[K] extends object
        ? K | `${Prefix}${K & string}.${AutoCompleteKey<T[K]>}`
        : `${Prefix}${K & string}`;
    }[keyof T & string];

type ValueFor<
  T,
  Key extends AutoCompleteKey<T>
> = Key extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? Rest extends AutoCompleteKey<T[First]>
      ? ValueFor<T[First], Rest>
      : never
    : never
  : Key extends keyof T
  ? T[Key]
  : never;

type UpdateFn<T> = <K extends AutoCompleteKey<T>>(
  key: K,
  value: ValueFor<T, K>
) => void;

export function useReactSettings() {
  const currentUser = useCurrentUser();
  const dispatch = useDispatch();

  const reactSettings =
    useSelector(
      (state: RootState) => state.user.changes?.company_user?.react_settings
    ) || {};

  const previousReactTableColumns =
    currentUser?.company_user?.settings?.react_table_columns;

  const settings: ReactSettings = {
    show_pdf_preview: true,
    react_notification_link: true,
    // This is legacy fallback for old settings location. If you see this in 2 years, feel free to remove it.
    react_table_columns: {
      ...previousReactTableColumns,
      ...reactSettings.react_table_columns,
    },
    preferences: {
      dashboard_charts: {
        default_view: 'month',
      },
    },
    ...reactSettings,
  };

  const update: UpdateFn<ReactSettings> = (property, value) => {
    return dispatch(
      updateChanges({
        property: property,
        value: value,
      })
    );
  };

  return { update, settings };
}
