/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSettings } from 'react-icons/fi';
import { useInjectUserChanges } from './useInjectUserChanges';
import { ReactSettings, useReactSettings } from './useReactSettings';
import { useDispatch, useStore } from 'react-redux';
import {
  injectInChanges,
  updateChanges,
  updateUser,
} from '../stores/slices/user';
import { toast } from '../helpers/toast/toast';
import { request } from '../helpers/request';
import { endpoint } from '../helpers';
import { ValidationBag } from '../interfaces/validation-bag';
import { AxiosError } from 'axios';
import { RootState } from '../stores/store';
import { GenericSingleResourceResponse } from '../interfaces/generic-api-response';
import { CompanyUser } from '../interfaces/company-user';
import { $refetch } from './useRefetch';

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

interface SaveOptions {
  silent: boolean;
}

export function usePreferences() {
  const user = useInjectUserChanges();

  const [t] = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState<ValidationBag | null>(null);

  const dispatch = useDispatch();

  const update: UpdateFn<ReactSettings> = (property, value) => {
    return dispatch(
      updateChanges({
        property: `company_user.react_settings.${property}`,
        value: value,
      })
    );
  };

  const { getState } = useStore<RootState>();

  const save = async ({ silent }: SaveOptions) => {
    !silent && toast.processing();

    request(
      'PUT',
      endpoint(
        `/api/v1/company_users/${user?.id}/preferences?include=company_user`
      ),
      {
        react_settings: getState().user.changes.company_user.react_settings,
      }
    )
      .then((response: GenericSingleResourceResponse<CompanyUser>) => {
        !silent && toast.success('updated_user');

        $refetch(['company_users']);

        dispatch(updateUser(response.data.data));
        dispatch(injectInChanges());

        setIsVisible(false);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        silent && toast.dismiss();

        if (error.response?.status === 412) {
          setErrors(error.response.data);
        }
      });
  };

  const Preferences = useMemo(
    () =>
      ({ children }: { children?: ReactNode; contentless?: boolean }) => {
        return (
          <>
            <Modal
              visible={isVisible}
              onClose={setIsVisible}
              title={t('preferences')}
            >
              {children}

              <Button onClick={save}>{t('save')}</Button>
            </Modal>

            <Button
              type="minimal"
              onClick={() => setIsVisible(true)}
              noBackgroundColor
            >
              <FiSettings />
            </Button>
          </>
        );
      },
    [isVisible, errors]
  );

  const settings = useReactSettings();

  return { Preferences, update, preferences: settings.preferences, save };
}
