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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { date, endpoint, isHosted } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { ApiToken } from '$app/common/interfaces/api-token';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useApiTokenQuery } from '$app/common/queries/api-tokens';
import { Badge } from '$app/components/Badge';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { Settings } from '$app/components/layouts/Settings';
import { PasswordConfirmation } from '$app/components/PasswordConfirmation';
import { ResourceActions } from '$app/components/ResourceActions';
import { useHandleChange } from './common/hooks/hooks';
import { useActions } from './common/hooks/useActions';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: fetchedApiToken } = useApiTokenQuery({ id });

  const colors = useColorScheme();

  const navigate = useNavigate();

  const { documentTitle } = useTitle('edit_token');

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    { name: t('api_tokens'), href: '/settings/integrations/api_tokens' },
    {
      name: t('edit_token'),
      href: route('/settings/integrations/api_tokens/:id/edit', { id }),
    },
  ];

  const actions = useActions();

  const { dateFormat } = useCurrentCompanyDateFormats();

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  const [isPasswordConfirmModalOpen, setIsPasswordConfirmModalOpen] =
    useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const [apiToken, setApiToken] = useState<ApiToken>();
  const [errors, setErrors] = useState<ValidationBag>();

  const handleChange = useHandleChange({ setApiToken, setErrors });

  const handleSave = (password: string, isPasswordRequired: boolean) => {
    if (!isFormBusy) {
      setErrors(undefined);
      toast.processing();
      setIsFormBusy(true);

      request('PUT', endpoint('/api/v1/tokens/:id', { id }), apiToken, {
        headers: { 'X-Api-Password': password },
      })
        .then(() => {
          toast.success('updated_token');

          $refetch(['tokens']);

          navigate(route('/settings/integrations/api_tokens'));
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }

          if (error.response?.status === 412) {
            onWrongPasswordEnter(isPasswordRequired);
            setIsPasswordConfirmModalOpen(true);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (fetchedApiToken) {
      setApiToken(fetchedApiToken);
    }
  }, [fetchedApiToken]);

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
        disableSaveButton={!apiToken || isFormBusy}
        onSaveClick={() => setIsPasswordConfirmModalOpen(true)}
        navigationTopRight={
          apiToken && (
            <ResourceActions
              resource={apiToken}
              label={t('more_actions')}
              actions={actions}
            />
          )
        }
      >
        {fetchedApiToken && apiToken && (
          <Card
            title={fetchedApiToken.name}
            className="shadow-sm"
            style={{ borderColor: colors.$24 }}
            headerStyle={{ borderColor: colors.$20 }}
          >
            <Element leftSide="Status">
              {!apiToken.is_deleted && !apiToken.archived_at && (
                <Badge variant="primary">{t('active')}</Badge>
              )}

              {apiToken.archived_at && !apiToken.is_deleted ? (
                <Badge variant="yellow">{t('archived')}</Badge>
              ) : null}

              {apiToken.is_deleted && (
                <Badge variant="red">{t('deleted')}</Badge>
              )}
            </Element>

            <Element leftSide={t('name')} required>
              <InputField
                value={apiToken.name}
                onValueChange={(value) => handleChange('name', value)}
                errorMessage={errors?.errors.name}
              />
            </Element>

            <Element leftSide={t('token')}>
              <CopyToClipboard
                secure
                className="break-all"
                text={apiToken.token}
              />
            </Element>

            <Element leftSide={t('created_on')}>
              {date(apiToken.created_at, dateFormat)}
            </Element>

            {isHosted() && (
              <Element leftSide={t('endpoint')}>
                <CopyToClipboard
                  className="break-all"
                  text="https://invoicing.co"
                />
              </Element>
            )}
          </Card>
        )}
      </Settings>
    </>
  );
}
