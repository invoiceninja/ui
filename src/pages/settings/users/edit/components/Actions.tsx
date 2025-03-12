/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { User } from '$app/common/interfaces/user';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdArchive,
  MdDelete,
  MdRemove,
  MdRestore,
  MdSend,
} from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

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

  const invite = () => {
    toast.processing();

    request('POST', endpoint('/api/v1/users/:id/invite', { id })).then(() => {
      $refetch(['users']);

      toast.success('email_sent_to_confirm_email');
    });
  };

  const remove = () => {
    toast.processing();

    request('DELETE', endpoint('/api/v1/users/:id/detach_from_company', { id }))
      .then(() => {
        toast.success('removed_user');

        $refetch(['users']);

        navigate('/settings/users');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
        }
      });
  };

  const bulk = () => {
    if (action === 'remove') {
      return remove();
    }

    const successMessages = {
      archive: 'archived_user',
      restore: 'restored_user',
      delete: 'deleted_user',
      remove: 'removed_user',
    };

    toast.processing();

    request('POST', endpoint('/api/v1/users/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        const message =
          successMessages[action as keyof typeof successMessages] ||
          `${action}d_user`;

        toast.success(message);

        $refetch(['users']);
      })
      .catch((error) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
        }
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
          <DropdownElement
            onClick={() => invite()}
            icon={<Icon element={MdSend} />}
          >
            {t('resend_email')}
          </DropdownElement>

          <DropdownElement
            onClick={() => {
              setAction('remove');
              setIsPasswordConfirmModalOpen(true);
            }}
            icon={<Icon element={MdRemove} />}
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
              icon={<Icon element={MdArchive} />}
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
              icon={<Icon element={MdRestore} />}
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
              icon={<Icon element={MdDelete} />}
            >
              {t('delete')}
            </DropdownElement>
          )}
        </div>
      </Dropdown>
    </>
  );
}
