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
import { atom, getDefaultStore, useAtomValue, useSetAtom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import {
  cloneDeep,
  get as lodashGet,
  has as lodashHas,
  isEqual,
  mergeWith,
  set as lodashSet,
  unset as lodashUnset,
} from 'lodash';
import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { endpoint } from '../helpers';
import { request } from '../helpers/request';
import type { User } from '../interfaces/user';
import { Record as ClientMapRecord } from '../constants/exports/client-map';
import { Entity } from '$app/components/CommonActionsPreferenceModal';
import { PerPage } from '$app/components/DataTable';
import { ThemeColorField } from '$app/pages/settings/user/components/StatusColorTheme';
import { ClientShowCard } from '$app/pages/clients/show/components/CardsCustomizationModal';
import { useCurrentUser } from './useCurrentUser';

export type ChartsDefaultView = 'day' | 'week' | 'month';

export interface TableFiltersPreference {
  filter?: string;
  customFilter?: string[];
  currentPage?: number;
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
    include_drafts: boolean;
    custom_start_date?: string;
    custom_end_date?: string;
  };
  datatables: {
    clients: {
      sort: string;
    };
  };
  reports: {
    columns: Record<string, ClientMapRecord[][]>;
  };
  auto_expand_product_table_notes: boolean;
  enable_public_notifications: boolean | null;
  use_system_fonts: boolean;
  use_legacy_editor: boolean;
  hide_peppol_sent_status: boolean;
  feedback_slider_displayed_at: number;
  feedback_given_at: number;
  price_increase_banner_dismissed_at?: number;
  document_builder_tour_shown?: boolean;
  document_upload_tour_shown?: boolean;
  blueprint_builder_tour_shown?: boolean;
}

export type ImportTemplates = Record<string, Record<string, (string | null)[]>>;

type ColorTheme = Record<ThemeColorField, string>;

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
  color_theme?: ColorTheme;
  client_show_cards?: ClientShowCard[];
  dashboard_fields?: string[];
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
    include_drafts: false,
  },
  datatables: {
    clients: {
      sort: 'id|desc',
    },
  },
  reports: {
    columns: {},
  },
  auto_expand_product_table_notes: false,
  enable_public_notifications: null,
  use_system_fonts: false,
  use_legacy_editor: false,
  hide_peppol_sent_status: false,
  feedback_slider_displayed_at: 0,
  feedback_given_at: 0,
  price_increase_banner_dismissed_at: 0,
};

// Committed `react_settings`, hydrated from the auth user payload.
// `null` means there is no active user yet.
export const reactSettingsAtom = atom<ReactSettings | null>(null);

// UserDetails-scoped draft; keeps page edits out of unrelated immediate saves.
export const userDetailsDraftAtom = atom<ReactSettings | null>(null);
export const userDetailsDraftDirtyPathsAtom = atom<string[]>([]);

function withDefaults(settings: ReactSettings | null): ReactSettings {
  const base: ReactSettings = {
    show_pdf_preview: true,
    react_notification_link: true,
    react_table_columns: {} as Record<ReactTableColumns, string[]>,
    preferences: cloneDeep(preferencesDefaults),
  };

  // Replace arrays during default merge; lodash.merge would merge by index.
  return mergeWith(
    base,
    (settings ?? {}) as ReactSettings,
    (_objValue, srcValue) => (Array.isArray(srcValue) ? srcValue : undefined)
  );
}

export function rollbackReactSettingsPaths(
  current: ReactSettings | null,
  failed: ReactSettings,
  previous: ReactSettings | null,
  paths: string[]
): ReactSettings | null {
  if (current === null) {
    return previous;
  }

  const rolledBack = cloneDeep(current);

  for (const path of paths) {
    if (!isEqual(lodashGet(current, path), lodashGet(failed, path))) {
      continue;
    }

    if (previous !== null && lodashHas(previous, path)) {
      lodashSet(
        rolledBack as object,
        path,
        cloneDeep(lodashGet(previous, path))
      );
    } else {
      lodashUnset(rolledBack as object, path);
    }
  }

  return rolledBack;
}

export const reactSettingsWithDefaultsAtom = atom((get) =>
  withDefaults(get(reactSettingsAtom))
);

export function useReactSettings() {
  return useAtomValue(reactSettingsWithDefaultsAtom);
}

// Focused subscription for primitives that should ignore unrelated writes.
export function useReactSettingsField<K extends keyof ReactSettings>(
  key: K
): ReactSettings[K] {
  const fieldAtom = useMemo(
    () => selectAtom(reactSettingsWithDefaultsAtom, (s) => s[key]),
    [key]
  );
  return useAtomValue(fieldAtom);
}

// Shared derived atom so draft readers share one subscription/merge pass.
export const draftOrCommittedReactSettingsAtom = atom((get) => {
  const draft = get(userDetailsDraftAtom);
  const committed = get(reactSettingsAtom);

  if (draft === null) {
    return withDefaults(committed);
  }

  const merged = cloneDeep(committed ?? draft);
  for (const path of get(userDetailsDraftDirtyPathsAtom)) {
    lodashSet(merged as object, path, cloneDeep(lodashGet(draft, path)));
  }

  return withDefaults(merged);
});

export function useDraftOrCommittedReactSettings(): ReactSettings {
  return useAtomValue(draftOrCommittedReactSettingsAtom);
}

// Draft-only writer; refusing missing drafts prevents accidental committed writes.
export function useUpdateDraftOrReactSettings() {
  const setDraft = useSetAtom(userDetailsDraftAtom);
  const setDirtyPaths = useSetAtom(userDetailsDraftDirtyPathsAtom);

  return useMemo(
    () => (property: string, value: unknown) => {
      const draft = getDefaultStore().get(userDetailsDraftAtom);
      if (draft === null) {
        if (import.meta.env.DEV) {
          console.warn(
            `[useUpdateDraftOrReactSettings] dropping write to "${property}" - no UserDetails draft is active`
          );
        }
        return;
      }
      setDirtyPaths((prev) =>
        prev.includes(property) ? prev : [...prev, property]
      );
      setDraft((prev) => {
        if (prev === null) return prev;
        const next = cloneDeep(prev);
        lodashSet(next as object, property, value);
        return next;
      });
    },
    [setDirtyPaths, setDraft]
  );
}

export function useUserDetailsDraft() {
  const setDraft = useSetAtom(userDetailsDraftAtom);
  const setDirtyPaths = useSetAtom(userDetailsDraftDirtyPathsAtom);
  const setReactSettings = useSetAtom(reactSettingsAtom);
  const flush = useFlushReactSettings();

  return useMemo(
    () => ({
      begin: () => {
        const committed = getDefaultStore().get(reactSettingsAtom);
        if (committed !== null) {
          setDraft(cloneDeep(committed));
          setDirtyPaths([]);
        }
      },
      commit: async (): Promise<unknown> => {
        const draft = getDefaultStore().get(userDetailsDraftAtom);
        if (draft === null) return undefined;
        const dirtyPaths = getDefaultStore().get(userDetailsDraftDirtyPathsAtom);
        if (dirtyPaths.length === 0) {
          setDraft(null);
          setDirtyPaths([]);
          return undefined;
        }
        const previous = getDefaultStore().get(reactSettingsAtom);
        const nextSettings = cloneDeep(previous ?? draft);

        for (const path of dirtyPaths) {
          lodashSet(
            nextSettings as object,
            path,
            cloneDeep(lodashGet(draft, path))
          );
        }

        setReactSettings(nextSettings);
        try {
          await flush();
          setDraft(null);
          setDirtyPaths([]);
          return undefined;
        } catch (err) {
          // Roll back only this draft's paths; concurrent immediate writes stay intact.
          setReactSettings(
            rollbackReactSettingsPaths(
              getDefaultStore().get(reactSettingsAtom),
              nextSettings,
              previous,
              dirtyPaths
            )
          );
          throw err;
        }
      },
      discard: () => {
        setDraft(null);
        setDirtyPaths([]);
      },
    }),
    [setDirtyPaths, setDraft, setReactSettings, flush]
  );
}

// Update the committed atom without a network request.
// Cancelable controls should stay local/draft-only until Save.
export function useUpdateReactSettings() {
  const setSettings = useSetAtom(reactSettingsAtom);

  return useMemo(
    () => (property: string, value: unknown) => {
      setSettings((prev) => {
        if (prev === null) {
          if (import.meta.env.DEV) {
            console.warn(
              `[useUpdateReactSettings] dropping write to "${property}" - atom not yet hydrated`
            );
          }
          return prev;
        }
        const next = cloneDeep(prev);
        lodashSet(next as object, property, value);
        return next;
      });
    },
    [setSettings]
  );
}

// Serialize PUTs; each queued request reads the atom when it fires.
let inflight: Promise<unknown> = Promise.resolve();

// Bumped on identity change so queued PUTs for a previous user abort.
let identityEpoch = 0;

export class ReactSettingsNotHydratedError extends Error {
  constructor() {
    super('react_settings atom is not hydrated yet');
    this.name = 'ReactSettingsNotHydratedError';
  }
}

export class ReactSettingsIdentityChangedError extends Error {
  constructor() {
    super('react_settings identity changed before PUT could fire');
    this.name = 'ReactSettingsIdentityChangedError';
  }
}

function resetInflight() {
  inflight = Promise.resolve();
}

function flushAtom(userId: string): Promise<unknown> {
  const capturedEpoch = identityEpoch;

  const next = inflight
    .catch(() => undefined)
    .then(() => {
      if (identityEpoch !== capturedEpoch) {
        throw new ReactSettingsIdentityChangedError();
      }

      const payload = getDefaultStore().get(reactSettingsAtom);
      if (payload === null) {
        throw new ReactSettingsNotHydratedError();
      }

      return request(
        'PUT',
        endpoint(`/api/v1/company_users/${userId}/preferences`),
        { react_settings: payload }
      );
    });

  inflight = next;
  return next;
}

// Hydrate from the auth user payload before paint; no separate GET is needed.
export function useFetchReactSettings(): void {
  const user = useCurrentUser();
  const setSettings = useSetAtom(reactSettingsAtom);
  const setUserDetailsDraft = useSetAtom(userDetailsDraftAtom);
  const setUserDetailsDraftDirtyPaths = useSetAtom(
    userDetailsDraftDirtyPathsAtom
  );
  const lastIdentityRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (!user || !user.id) {
      if (lastIdentityRef.current !== null) {
        lastIdentityRef.current = null;
        identityEpoch += 1;
        resetInflight();
        setUserDetailsDraft(null);
        setUserDetailsDraftDirtyPaths([]);
        setSettings(null);
      }
      return;
    }

    const identity = `${user.id}:${user.company_user?.company?.id ?? ''}`;
    if (identity === lastIdentityRef.current) return;

    // Abort any pending saves for the previous identity.
    lastIdentityRef.current = identity;
    identityEpoch += 1;
    resetInflight();
    setUserDetailsDraft(null);
    setUserDetailsDraftDirtyPaths([]);

    const serverSettings = (user.company_user?.react_settings ??
      {}) as ReactSettings;

    // Fold legacy table columns into the new location without writing an empty key.
    const legacyTableColumns = (user.company_user?.settings as
      | { react_table_columns?: Record<ReactTableColumns, string[]> }
      | undefined)?.react_table_columns;

    const mergedTableColumns = {
      ...(legacyTableColumns ?? {}),
      ...(serverSettings.react_table_columns ?? {}),
    } as Record<ReactTableColumns, string[]>;

    const hydrated: ReactSettings = { ...serverSettings };
    if (Object.keys(mergedTableColumns).length > 0) {
      hydrated.react_table_columns = mergedTableColumns;
    }

    setSettings(hydrated);
  }, [user, setSettings, setUserDetailsDraft, setUserDetailsDraftDirtyPaths]);
}

// Optimistic committed write + sequenced PUT. Shared saves are latest-state-wins;
// cancelable flows keep local/draft state and roll back only their dirty paths.
export function useSaveReactSettings() {
  const updateSettings = useUpdateReactSettings();
  const userId = useSelector(
    (state: RootState) => (state.user.user as User | undefined)?.id
  );

  return useCallback(
    (property: string, value: unknown) => {
      updateSettings(property, value);
      if (!userId) return Promise.resolve();

      return flushAtom(userId).catch((err) => {
        if (err instanceof ReactSettingsNotHydratedError) return undefined;
        throw err;
      });
    },
    [updateSettings, userId]
  );
}

// PUT the current atom snapshot without applying another local write.
export function useFlushReactSettings() {
  const userId = useSelector(
    (state: RootState) => (state.user.user as User | undefined)?.id
  );

  return useCallback(() => {
    if (!userId) return Promise.resolve();
    return flushAtom(userId).catch((err) => {
      if (err instanceof ReactSettingsNotHydratedError) return undefined;
      throw err;
    });
  }, [userId]);
}
