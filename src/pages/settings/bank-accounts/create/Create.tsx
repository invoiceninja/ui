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
import { InputField } from '@invoiceninja/forms';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Settings } from '../../../../components/layouts/Settings';
import { BankAccountValidation } from '../common/ValidationInterface';

const Create = () => {
  useTitle('create_bank_account');
  const [t] = useTranslation();
  const navigate = useNavigate();
  const bankAccountForm = useRef<any>();
  const [errors, setErrors] = useState<BankAccountValidation | undefined>(
    undefined
  );

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
  ];

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      bank_account_name: '',
    },
    onSubmit: async (values: any) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);

      try {
        await request('POST', endpoint('/api/v1/bank_integrations'), values);
        toast.success(t('created_bank_account'), { id: toastId });
        navigate(route('/settings/bank_accounts'));
      } catch (error: any) {
        console.error(error);
        toast.error(t('error_title'), { id: toastId });
        if (error?.response?.status === 422) {
          setErrors(error?.response?.data);
        }
      }
      form.setSubmitting(false);
    },
  });

  const handleCancel = (): void => {
    navigate(route('/settings/bank_accounts'));
  };

  const handleSave = (event: any): void => {
    event?.preventDefault();
    form?.handleSubmit(event);
  };

  return (
    <Settings
      title={t('create_bank_account')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#create_bank_account"
      onCancelClick={handleCancel}
      onSaveClick={handleSave}
    >
      <Card title={t('create_bank_account')}>
        <form ref={bankAccountForm} className="my-6 space-y-4">
          <Element leftSide={t('bank_account_name')}>
            <InputField
              id="bank_account_name"
              value={form?.values?.bank_account_name}
              onChange={form?.handleChange}
              errorMessage={errors?.bank_account_name}
            />
          </Element>
        </form>
      </Card>
    </Settings>
  );
};
export default Create;
