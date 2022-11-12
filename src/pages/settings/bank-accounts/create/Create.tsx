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
import { useBankAccountPages } from '../common/hooks/useBankAccountPages';
import { BankAccountValidation } from '../common/validation/ValidationInterface';

const Create = () => {
  useTitle('create_bank_account');
  const [t] = useTranslation();
  const navigate = useNavigate();
  const pages = useBankAccountPages();
  const bankAccountForm = useRef<any>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<BankAccountValidation | undefined>(
    undefined
  );

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      bank_account_name: '',
    },
    onSubmit: async (values: any) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);
      setIsFormBusy(true);

      if (values?.bank_account_name?.length < 4) {
        setErrors({
          bank_account_name: [
            'Bank account name should be at least 4 characters long.',
          ],
        });
        toast.dismiss();
        setIsFormBusy(false);
        return;
      }

      try {
        request('POST', endpoint('/api/v1/bank_integrations'), values);
        toast.success(t('created_bank_account'), { id: toastId });
        navigate(route('/settings/bank_accounts'));
      } catch (error: any) {
        console.error(error);
        toast.error(t('error_title'), { id: toastId });
        if (error?.response?.status === 422) {
          setErrors(error?.response?.data);
        }
      }
      setIsFormBusy(false);
      form.setSubmitting(false);
    },
  });

  const handleCancel = (): void => {
    if (!isFormBusy) {
      navigate(route('/settings/bank_accounts'));
    }
  };

  const handleSave = (event: any): void => {
    if (!isFormBusy) {
      event?.preventDefault();
      form?.handleSubmit(event);
    }
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
        <form
          onSubmit={(e) => e.preventDefault()}
          ref={bankAccountForm}
          className="my-6 space-y-4"
        >
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
