/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import axios, { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { defaultHeaders } from 'common/queries/common/headers';
import { updateRecord } from 'common/stores/slices/company-users';
import { Button } from 'components/forms/Button';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Element } from '@invoiceninja/cards';
import { request } from 'common/helpers/request';

export function DeleteLogo() {
  const [t] = useTranslation();

  const companyChanges = useCompanyChanges();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: companyChanges,
    onSubmit: () => {
      const toastId = toast.loading(t('processing'));

      request(
        'PUT',
        endpoint('/api/v1/companies/:id', { id: company.id }),
        formik.values
      )
        .then((response: AxiosResponse) => {
          dispatch(
            updateRecord({ object: 'company', data: response.data.data })
          );

          toast.success(t('removed_logo'), { id: toastId });
        })
        .catch((error: AxiosError) => {
          console.error(error);

          toast.error(t('error_title'), { id: toastId });
        });
    },
  });

  const deleteLogo = () => {
    formik.setFieldValue('settings.company_logo', '');
    formik.submitForm();
  };

  return (
    <Element>
      <Button behavior="button" type="minimal" onClick={() => deleteLogo()}>
        {t('remove_logo')}
      </Button>
    </Element>
  );
}
