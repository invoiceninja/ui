/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { getDefaultStore, useSetAtom } from 'jotai';
import { cloneDeep, get as lodashGet, set as lodashSet } from 'lodash';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '$app/components/forms';
import { Gear } from '$app/components/icons/Gear';
import { Modal } from '$app/components/Modal';
import { useColorScheme } from '../colors';
import { toast } from '../helpers/toast/toast';
import {
  ReactSettings,
  reactSettingsAtom,
  rollbackReactSettingsPaths,
  useFlushReactSettings,
  useReactSettings,
  useUpdateReactSettings,
} from './useReactSettings';

type AutoCompleteKey<T, Prefix extends string = ''> = keyof T extends never
  ? Prefix
  : {
      [K in keyof T & string]: T[K] extends object
        ? K | `${Prefix}${K & string}.${AutoCompleteKey<T[K]>}`
        : `${Prefix}${K & string}`;
    }[keyof T & string];

type ValueFor<
  T,
  Key extends AutoCompleteKey<T>,
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

interface SaveOptions {
  silent: boolean;
}

export function usePreferences() {
  const updateSettings = useUpdateReactSettings();
  const flushSettings = useFlushReactSettings();
  const setSettings = useSetAtom(reactSettingsAtom);

  const [t] = useTranslation();

  const colors = useColorScheme();
  const settings = useReactSettings();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [draftSettings, setDraftSettings] = useState<ReactSettings | null>(
    null
  );
  const draftDirtyPathsRef = useRef<string[]>([]);

  const activeSettings = useMemo(() => {
    if (draftSettings === null) {
      return settings;
    }

    const merged = cloneDeep(settings);
    for (const path of draftDirtyPathsRef.current) {
      lodashSet(
        merged as object,
        path,
        cloneDeep(lodashGet(draftSettings, path))
      );
    }

    return merged;
  }, [draftSettings, settings]);

  const update: UpdateFn<ReactSettings> = useCallback(
    (property, value) => {
      const propertyPath = property as string;

      if (draftSettings !== null) {
        if (!draftDirtyPathsRef.current.includes(propertyPath)) {
          draftDirtyPathsRef.current = [
            ...draftDirtyPathsRef.current,
            propertyPath,
          ];
        }

        setDraftSettings((current) => {
          if (current === null) return current;

          const next = cloneDeep(current);
          lodashSet(next as object, propertyPath, value);
          return next;
        });
        return;
      }

      updateSettings(propertyPath, value);
    },
    [draftSettings, updateSettings]
  );

  const openModal = useCallback(() => {
    if (getDefaultStore().get(reactSettingsAtom) === null) return;

    draftDirtyPathsRef.current = [];
    setDraftSettings(cloneDeep(settings));
    setIsVisible(true);
  }, [settings]);

  const closeModal = useCallback(() => {
    draftDirtyPathsRef.current = [];
    setDraftSettings(null);
    setIsVisible(false);
  }, []);

  const save = useCallback(
    async ({ silent }: SaveOptions) => {
      !silent && toast.processing();

      const draft = draftSettings;
      const dirtyPaths = [...draftDirtyPathsRef.current];
      const previous = getDefaultStore().get(reactSettingsAtom);
      let nextSettings: ReactSettings | null = null;

      try {
        if (draft !== null) {
          if (dirtyPaths.length === 0) {
            !silent && toast.success('updated_user');
            draftDirtyPathsRef.current = [];
            setDraftSettings(null);
            setIsVisible(false);
            return;
          }

          nextSettings = cloneDeep(previous ?? draft);

          for (const path of dirtyPaths) {
            lodashSet(
              nextSettings as object,
              path,
              cloneDeep(lodashGet(draft, path))
            );
          }

          setSettings(nextSettings);
        }

        await flushSettings();
        !silent && toast.success('updated_user');
        draftDirtyPathsRef.current = [];
        setDraftSettings(null);
        setIsVisible(false);
      } catch {
        if (nextSettings !== null) {
          setSettings(
            rollbackReactSettingsPaths(
              getDefaultStore().get(reactSettingsAtom),
              nextSettings,
              previous,
              dirtyPaths
            )
          );
        }

        toast.dismiss();
      }
    },
    [draftSettings, flushSettings, setSettings]
  );

  const Preferences = useMemo(
    () =>
      ({ children }: { children?: ReactNode; contentless?: boolean }) => {
        return (
          <>
            <Modal
              visible={isVisible}
              onClose={closeModal}
              title={t('preferences')}
              overflowVisible
            >
              {children}

              <Button onClick={() => save({ silent: false })}>
                {t('save')}
              </Button>
            </Modal>

            <div
              className="flex items-center justify-center p-2 cursor-pointer border rounded-md shadow-sm"
              onClick={openModal}
              style={{
                backgroundColor: colors.$1,
                borderColor: colors.$24,
              }}
            >
              <Gear color={colors.$3} />
            </div>
          </>
        );
      },
    [
      colors.$1,
      colors.$24,
      colors.$3,
      closeModal,
      isVisible,
      openModal,
      save,
      t,
    ]
  );

  return { Preferences, update, preferences: activeSettings.preferences, save };
}
