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
import { defaultAccountDetails } from 'common/constants/bank-accounts';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { BankAccDetails } from 'common/interfaces/bank-accounts';
import { useFormik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings } from '../../../../components/layouts/Settings';
import { BankAccountValidation } from '../common/ValidationInterface';

const Edit = () => {
  useTitle('edit_bank_account');
  const [t] = useTranslation();
  const { id: bankAccountId } = useParams<string>();
  const navigate = useNavigate();
  const bankAccountForm = useRef<any>();
  const [errors, setErrors] = useState<BankAccountValidation | undefined>(
    undefined
  );
  const [bankAccountDetails, setBankAccountDetails] = useState<BankAccDetails>(
    defaultAccountDetails
  );

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('bank_accounts'), href: '/settings/bank_accounts' },
  ];

  const fetchBankAccountDetails = async () => {
    toast.loading(t('processing'));

    try {
      const { data: responseData } = await request(
        'GET',
        endpoint('/api/v1/bank_integrations/:id', { id: bankAccountId })
      );
      setBankAccountDetails(responseData?.data);
    } catch (error) {
      console.error(error);
      navigate(route('/settings/bank_accounts'));
    }
    toast.dismiss();
  };

  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      bank_account_name: bankAccountDetails?.bank_account_name,
    },
    onSubmit: async (values: any) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);

      try {
        await request(
          'PUT',
          endpoint('/api/v1/bank_integrations/:id', { id: bankAccountId }),
          values
        );
        toast.success(t('updated_bank_account'), { id: toastId });
        navigate(route('/settings/bank_accounts'));
        return;
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
    return;
  };

  const handleSave = (event: any): void => {
    event?.preventDefault();
    form?.handleSubmit(event);
  };

  useEffect(() => {
    fetchBankAccountDetails();
  }, []);

  return (
    <Settings
      title={t('edit_bank_account')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#edit_bank_account"
      onCancelClick={handleCancel}
      onSaveClick={handleSave}
    >
      <Card title={t('edit_bank_account')}>
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
export default Edit;
