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

export function DeleteLogo() {
  const [t] = useTranslation();
  const compoanyChanges = useCompanyChanges();
  const company = useCurrentCompany();
  const dispatch = useDispatch();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: compoanyChanges,
    onSubmit: () => {
      toast.loading(t('processing'));

      axios
        .put(
          endpoint('/api/v1/companies/:id', { id: company.id }),
          formik.values,
          {
            headers: defaultHeaders,
          }
        )
        .then((response: AxiosResponse) => {
          dispatch(
            updateRecord({ object: 'company', data: response.data.data })
          );

          toast.dismiss();
          toast.success(t('removed_logo'));
        })
        .catch((error: AxiosError) => {
          console.error(error);

          toast.dismiss();
          toast.error(t('error_title'));
        });
    },
  });
  const deleteLogo = () => {
    formik.setFieldValue('settings.company_logo', '');
    formik.submitForm();
  };
  return (
    <Element leftSide={t('remove_logo')}>
      <Button
        behavior="button"
        type="minimal"
        onClick={() => {
          deleteLogo();
        }}
      >
        {t('remove_logo')}
      </Button>
    </Element>
  );
}
