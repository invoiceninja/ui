/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { Disconnect } from './Onboarding';
import Toggle from '$app/components/forms/Toggle';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useFormik } from 'formik';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';

export function Preferences() {
  const { t } = useTranslation();
  const company = useCurrentCompany();
  const refresh = useRefreshCompanyUsers();

  const form = useFormik({
    initialValues: {
      acts_as_sender: company?.tax_data?.acts_as_sender,
      acts_as_receiver: company?.tax_data?.acts_as_receiver,
    },
    onSubmit: (values) => {
      toast.processing();

      request('PUT', endpoint('/api/v1/einvoice/peppol/update'), values)
        .then(() => {
          toast.success(t('updated_settings')!);
        })
        .catch(() => {
          toast.error();
        })
        .finally(() => refresh());
    },
  });

  return (
    <Card title={`PEPPOL: ${t('preferences')}`}>
      <Element leftSide={t('disconnect')}>
        <div className="flex items-center gap-1">
          <p>{t('peppol_disconnect_short')}</p>

          <Disconnect />
        </div>
      </Element>

      <Element leftSide={t('act_as_sender')}>
        <Toggle
          checked={form.values.acts_as_sender}
          onValueChange={(v) => {
            form.setFieldValue('acts_as_sender', v);
            form.submitForm();
          }}
        />
      </Element>

      <Element leftSide={t('act_as_receiver')}>
        <Toggle
          checked={form.values.acts_as_receiver}
          onValueChange={(v) => {
            form.setFieldValue('acts_as_receiver', v);
            form.submitForm();
          }}
        />
      </Element>
    </Card>
  );
}
