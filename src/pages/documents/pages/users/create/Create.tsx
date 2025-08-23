/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { User } from '$app/common/interfaces/docuninja/api';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { route } from '$app/common/helpers/route';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { Spinner } from '$app/components/Spinner';
import { useBlankDocuNinjaUserQuery } from '$app/common/queries/docuninja/users';
import { Default } from '$app/components/layouts/Default';
import { Tab } from '$app/components/Tabs';
import { TabGroup } from '$app/components/TabGroup';
import Permissions from '../common/components/Permissions';
import Details from '../common/components/Details';

export default function Create() {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const pages = [
    {
      name: t('users'),
      href: '/documents/users',
    },
    {
      name: t('new_user'),
      href: '/documents/users/create',
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('user_details'),
      href: '/documents/users/create',
    },
    {
      name: t('permissions'),
      href: '/documents/users/create/permissions',
    },
  ];

  const [user, setUser] = useState<User>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const { data: blankUser, isLoading } = useBlankDocuNinjaUserQuery();

  const handleCreate = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request('POST', docuNinjaEndpoint('/api/users'), user, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      })
        .then((response: GenericSingleResourceResponse<User>) => {
          toast.success('created_user');

          $refetch(['docuninja_users']);

          setUser(cloneDeep(blankUser));

          navigate(
            route('/documents/users/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (blankUser) {
      setUser(blankUser);
    }
  }, [blankUser]);

  useSaveBtn(
    {
      onClick: handleCreate,
      disableSaveButton: isFormBusy || !user,
    },
    [user]
  );

  return (
    <Default title={t('new_user')} breadcrumbs={pages}>
      {!isLoading && user ? (
        <div className="space-y-4">
          <TabGroup tabs={[t('user_details'), t('permissions')]}>
            <div>
              <Details user={user} setUser={setUser} errors={errors} />
            </div>

            <div>
              <Permissions user={user} setUser={setUser} errors={errors} />
            </div>
          </TabGroup>
        </div>
      ) : (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      )}
    </Default>
  );
}
