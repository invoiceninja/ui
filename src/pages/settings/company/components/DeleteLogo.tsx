/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from '$app/common/helpers';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { Button } from '$app/components/forms/Button';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Element } from '$app/components/cards';
import { request } from '$app/common/helpers/request';

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
