/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { User } from 'common/interfaces/user';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

interface Props {
  user: User;
}

export function Actions(props: Props) {
  const [t] = useTranslation();
  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState(false);
  const [action, setAction] = useState<
    'archive' | 'restore' | 'delete' | 'remove'
  >();

  const { user } = props;
  const { id } = useParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const invite = () => {
    const toastId = toast.loading(t('processing'));

    request('POST', endpoint('/api/v1/users/:id/invite', { id }))
      .then(() =>
        toast.success(t('email_sent_to_confirm_email'), { id: toastId })
      )
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };

  const remove = () => {
    const toastId = toast.loading(t('processing'));

    request('DELETE', endpoint('/api/v1/users/:id/detach_from_company', { id }))
      .then(() => {
        toast.success(t('removed_user'), { id: toastId });
        navigate('/settings/users');
      })
      .catch((error) => {
        console.error(error);

        error.response?.status === 412
          ? toast.error(t('password_error_incorrect'), { id: toastId })
          : toast.error(t('error_title'), { id: toastId });
      });
  };

  const bulk = () => {
    if (action === 'remove') {
      return remove();
    }

    const toastId = toast.loading(t('processing'));

    request('POST', endpoint('/api/v1/users/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        toast.success(t(`${action}d_user`), { id: toastId });
        queryClient.invalidateQueries(
          generatePath('/api/v1/users/:id', { id })
        );
      })
      .catch((error) => {
        console.error(error);

        error.response?.status === 412
          ? toast.error(t('password_error_incorrect'), { id: toastId })
          : toast.error(t('error_title'), { id: toastId });
      });
  };

  return (
    <>
      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
        onSave={bulk}
      />

      <Dropdown label={t('more_actions')} className="divide-y">
        <div>
          <DropdownElement onClick={() => invite()}>
            {t('resend_email')}
          </DropdownElement>

          <DropdownElement
            onClick={() => {
              setAction('remove');
              setIsPasswordConfirmModalOpen(true);
            }}
          >
            {t('remove')}
          </DropdownElement>
        </div>

        <div>
          {user.archived_at === 0 && (
            <DropdownElement
              onClick={() => {
                setAction('archive');
                setIsPasswordConfirmModalOpen(true);
              }}
            >
              {t('archive')}
            </DropdownElement>
          )}

          {user.archived_at > 0 && (
            <DropdownElement
              onClick={() => {
                setAction('restore');
                setIsPasswordConfirmModalOpen(true);
              }}
            >
              {t('restore')}
            </DropdownElement>
          )}

          {!user.is_deleted && (
            <DropdownElement
              onClick={() => {
                setAction('delete');
                setIsPasswordConfirmModalOpen(true);
              }}
            >
              {t('delete')}
            </DropdownElement>
          )}
        </div>
      </Dropdown>
    </>
  );
}
