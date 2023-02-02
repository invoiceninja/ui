/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { useTranslation } from 'react-i18next';
import { Settings } from 'components/layouts/Settings';
import { InputField } from '@invoiceninja/forms';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { useNavigate } from 'react-router-dom';
import { PasswordConfirmation } from 'components/PasswordConfirmation';
import { useTitle } from 'common/hooks/useTitle';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { ApiToken } from 'common/interfaces/api-token';
import { useBlankApiTokenQuery } from 'common/queries/api-tokens';
import { useHandleChange } from './common/hooks/hooks';
import { toast } from 'common/helpers/toast/toast';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';

export function Create() {
  const [t] = useTranslation();
  const { documentTitle } = useTitle('new_token');
  const navigate = useNavigate();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    { name: t('api_tokens'), href: '/settings/integrations/api_tokens' },
    {
      name: t('new_token'),
      href: '/settings/integrations/api_tokens/create',
    },
  ];

  const { data: blankApiToken } = useBlankApiTokenQuery();

  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [apiToken, setApiToken] = useState<ApiToken>();
  const [errors, setErrors] = useState<ValidationBag>();

  const handleChange = useHandleChange({ setApiToken, setErrors });

  const handleSave = (password: string) => {
    if (!isFormBusy) {
      setErrors(undefined);
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/tokens'), apiToken, {
        headers: { 'X-Api-Password': password },
      })
        .then((response: GenericSingleResourceResponse<ApiToken>) => {
          toast.success('created_token');

          navigate(
            route('/settings/integrations/api_tokens/:id/edit', {
              id: response.data.data.id,
            })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
            return;
          }

          if (error.response?.status === 412) {
            toast.error('password_error_incorrect');
          } else {
            console.error(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (blankApiToken) {
      setApiToken(blankApiToken);
    }
  }, [blankApiToken]);

  return (
    <>
      <PasswordConfirmation
        show={isPasswordConfirmModalOpen}
        onClose={setIsPasswordConfirmModalOpen}
        onSave={handleSave}
      />

      <Settings
        title={documentTitle}
        breadcrumbs={pages}
        onSaveClick={() => setIsPasswordConfirmModalOpen(true)}
        disableSaveButton={!apiToken}
      >
        <Card title={t('new_token')}>
          <Element leftSide={t('name')} required>
            <InputField
              required
              onValueChange={(value) => handleChange('name', value)}
              errorMessage={errors?.errors.name}
            />
          </Element>
        </Card>
      </Settings>
    </>
  );
}
