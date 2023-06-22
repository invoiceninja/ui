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
import { Button, InputField } from '$app/components/forms';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSettings } from 'react-icons/fi';
import { useInjectUserChanges } from './useInjectUserChanges';
import { ReactSettings } from './useReactSettings';
import { useDispatch } from 'react-redux';
import { updateChanges } from '../stores/slices/user';
import { toast } from '../helpers/toast/toast';
import { request } from '../helpers/request';
import { endpoint } from '../helpers';
import { useQueryClient } from 'react-query';
import { route } from '../helpers/route';
import { ValidationBag } from '../interfaces/validation-bag';
import { AxiosError } from 'axios';
import { usePasswordConfirmation } from '$app/components/PasswordConfirmation';

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

export function usePreferences() {
  const user = useInjectUserChanges();
  const queryClient = useQueryClient();
  const { isPasswordRequired, touch } = usePasswordConfirmation();

  const [t] = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState<ValidationBag | null>(null);

  const dispatch = useDispatch();
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const update: UpdateFn<ReactSettings> = (property, value) => {
    return dispatch(
      updateChanges({
        property: `company_user.react_settings.${property}`,
        value: value,
      })
    );
  };

  const save = () => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/users/:id?include=company_user', {
        id: user?.id,
      }),
      user,
      {
        headers: {
          'X-Api-Password': isPasswordRequired()
            ? passwordRef.current!.value
            : '',
        },
      }
    )
      .then(() => {
        toast.success('updated_user');

        queryClient.invalidateQueries(
          route('/api/v1/users/:id', { id: user?.id })
        );

        setIsVisible(false);
        touch();
      })
      .catch((error: AxiosError<ValidationBag>) => {
        console.error(error);

        if (error.response?.status === 412) {
          setErrors(error.response.data);
        }

        toast.error();
      });
  };

  const Preferences = useMemo(
    () =>
      ({
        children,
        contentless,
      }: {
        children?: ReactNode;
        contentless?: boolean;
      }) => {
        useEffect(() => {
          if (isVisible && contentless && !isPasswordRequired()) {
            // We have no content and since password isn't required,
            // let's just submit the form for the user.

            save();
          }
        }, [isVisible]);

        return (
          <>
            <Modal
              visible={isVisible}
              onClose={setIsVisible}
              title={t('preferences')}
            >
              {children}

              {isPasswordRequired() && (
                <InputField
                  label={t('password')}
                  innerRef={passwordRef}
                  type="password"
                  errorMessage={errors?.message}
                />
              )}

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
    [isVisible, passwordRef, errors]
  );

  return { Preferences, update, trigger: () => setIsVisible(true) };
}
