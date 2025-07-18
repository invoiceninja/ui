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
import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { cloneDeep, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { AxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { Spinner } from '$app/components/Spinner';
import { useDocuNinjaUserQuery } from '$app/common/queries/docuninja/users';
import { Default } from '$app/components/layouts/Default';
import { route } from '$app/common/helpers/route';
import { useColorScheme } from '$app/common/colors';

function Create() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const pages = [
    {
      name: t('users'),
      href: '/documents/users',
    },
    {
      name: t('edit_user'),
      href: route('/documents/users/:id/edit', { id }),
    },
  ];

  const [user, setUser] = useState<User>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const { data: userResponse, isLoading } = useDocuNinjaUserQuery({
    id,
  });

  const handleChange = (key: keyof User, value: string) => {
    const updatedUser = cloneDeep(user) as User;

    set(updatedUser, key, value);

    setUser(updatedUser);
  };

  const handleCreate = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);

      setIsFormBusy(true);

      request(
        'PUT',
        docuNinjaEndpoint('/api/users/:id', {
          id,
        }),
        user,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then(() => {
          toast.success('updated_user');

          $refetch(['docuninja_users']);
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
    if (userResponse) {
      setUser(userResponse);
    }
  }, [userResponse]);

  useSaveBtn(
    {
      onClick: handleCreate,
      disableSaveButton: isFormBusy || !user,
    },
    [user]
  );

  return (
    <Default title={t('edit_user')} breadcrumbs={pages}>
      <div className="flex justify-center">
        <Card
          title={t('edit_user')}
          className="shadow-sm w-full lg:w-2/3"
          childrenClassName="pb-8"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          ) : (
            <>
              <Element leftSide={t('first_name')}>
                <InputField
                  value={user?.first_name}
                  onValueChange={(value) => handleChange('first_name', value)}
                  errorMessage={errors?.errors.first_name}
                />
              </Element>

              <Element leftSide={t('last_name')}>
                <InputField
                  value={user?.last_name}
                  onValueChange={(value) => handleChange('last_name', value)}
                  errorMessage={errors?.errors.last_name}
                />
              </Element>

              <Element leftSide={t('email')}>
                <InputField
                  value={user?.email}
                  onValueChange={(value) => handleChange('email', value)}
                  errorMessage={errors?.errors.email}
                />
              </Element>
            </>
          )}
        </Card>
      </div>
    </Default>
  );
}

export default Create;
