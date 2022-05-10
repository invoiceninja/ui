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
import { InputField, Link } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import {
  injectInChanges,
  resetChanges,
  updateChanges,
  updateRecord,
} from 'common/stores/slices/company-users';
import { Settings } from 'components/layouts/Settings';
import { ChangeEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function GoogleAnalytics() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('account_management'), href: '/settings/account_management' },
    {
      name: t('google_analytics'),
      href: '/settings/integrations/google_analytics',
    },
  ];

  useTitle('google_analytics');

  const dispatch = useDispatch();
  const company = useCurrentCompany();
  const companyChanges = useCompanyChanges();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'workflow_settings'
    )}`;

    dispatch(injectInChanges({ object: 'company', data: company }));
  }, [company]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) =>
    dispatch(
      updateChanges({
        object: 'company',
        property: event.target.id,
        value: event.target.value,
      })
    );

  const onSave = () => {
    const toastId = toast.loading(t('processing'));

    request(
      'PUT',
      endpoint('/api/v1/companies/:id', { id: companyChanges.id }),
      companyChanges
    )
      .then((response) => {
        dispatch(updateRecord({ object: 'company', data: response.data.data }));

        toast.success(t('updated_settings'), { id: toastId });
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.success(t('error_title'), { id: toastId });
      });
  };

  return (
    <Settings
      title={t('google_analytics')}
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={() => dispatch(resetChanges('company'))}
    >
      <Card title={t('google_analytics')}>
        <Element
          leftSide={t('tracking_id')}
          leftSideHelp={
            <Link
              to="https://support.google.com/analytics/answer/1037249?hl=en"
              external
            >
              {t('learn_more')}
            </Link>
          }
        >
          <InputField
            id="google_analytics_key"
            value={companyChanges?.google_analytics_key}
            onChange={handleChange}
          />
        </Element>
      </Card>
    </Settings>
  );
}
