/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { omit } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';
import { $refetch } from '$app/common/hooks/useRefetch';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { User } from '$app/common/interfaces/user';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { updateUser } from '$app/common/stores/slices/user';
import { Button, InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { PasswordConfirmation } from './PasswordConfirmation';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function UserDetailsModal({ visible, onClose }: Props) {
  const [t] = useTranslation();

  const dispatch = useDispatch();

  const user = useCurrentUser();

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState<boolean>(false);

  const handleSave = () => {
    const currentErrors: ValidationBag['errors'] = {};

    if (!firstName.trim()) {
      currentErrors.first_name = [t('please_enter_a_first_name')];
    }

    if (!lastName.trim()) {
      currentErrors.last_name = [t('please_enter_a_last_name')];
    }

    if (Object.keys(currentErrors).length) {
      setErrors({ message: 'error', errors: currentErrors });

      return;
    }

    setErrors(undefined);
    setIsPasswordConfirmModalOpen(true);
  };

  const handleUpdateUser = (password: string, passwordIsRequired: boolean) => {
    if (isFormBusy || !user) {
      return;
    }

    toast.processing();

    setIsFormBusy(true);

    request(
      'PUT',
      endpoint('/api/v1/users/:id?include=company_user', { id: user.id }),
      {
        ...omit(user, 'company_user'),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      },
      { headers: { 'X-Api-Password': password } }
    )
      .then((response: GenericSingleResourceResponse<User>) => {
        toast.success('updated_settings');

        $refetch(['users']);

        dispatch(updateUser(response.data.data));
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 412) {
          onWrongPasswordEnter(passwordIsRequired);
          setIsPasswordConfirmModalOpen(true);
        }

        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  useEffect(() => {
    if (visible) {
      setErrors(undefined);
      setFirstName(user?.first_name ?? '');
      setLastName(user?.last_name ?? '');
    }
  }, [visible]);

  return (
    <>
      <Modal
        title={t('user_details')!}
        visible={visible}
        onClose={onClose}
        size="small"
        disableClosing={isFormBusy}
        withoutVerticalMargin
      >
        <div className="space-y-4 mt-4">
          <InputField
            label={t('first_name')}
            value={firstName}
            onValueChange={setFirstName}
            errorMessage={errors?.errors?.first_name}
            required
          />

          <InputField
            label={t('last_name')}
            value={lastName}
            onValueChange={setLastName}
            errorMessage={errors?.errors?.last_name}
            required
          />

          <div className="flex justify-end">
            <Button
              behavior="button"
              onClick={handleSave}
              disabled={isFormBusy}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>

      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
        onSave={handleUpdateUser}
      />
    </>
  );
}
