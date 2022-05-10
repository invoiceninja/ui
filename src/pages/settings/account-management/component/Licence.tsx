/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { Divider } from 'components/cards/Divider';
import { Modal } from 'components/Modal';
import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClickableElement } from '../../../../components/cards';

export function License() {
  const [t] = useTranslation();
  const link = import.meta.env.VITE_WHITELABEL_INVOICE_URL as unknown as string;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const formik = useFormik({
    initialValues: {
      license: '',
    },
    onSubmit: (values) => {
      toast.loading(t('processing'));

      request(
        'POST',
        endpoint('/api/v1/claim_license?license_key=:key', {
          key: values.license,
        })
      )
        .then(() => {
          toast.dismiss();
          toast.success(t('bought_white_label'));

          setIsModalVisible(false);
        })
        .catch((error: AxiosError) => {
          toast.dismiss();

          error.response?.status === 400
            ? toast.error(error.response.data.message)
            : toast.error(t('error_title'));
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <>
      <Modal
        title={t('apply_license')}
        visible={isModalVisible}
        onClose={setIsModalVisible}
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <InputField
            onChange={formik.handleChange}
            label={t('license')}
            id="license"
            required
          />

          <Button disabled={formik.isSubmitting} variant="block">
            {t('submit')}
          </Button>
        </form>
      </Modal>

      <Divider />

      <ClickableElement href={link}>{t('purchase_license')}</ClickableElement>

      <ClickableElement onClick={() => setIsModalVisible(true)}>
        {t('apply_license')}
      </ClickableElement>
    </>
  );
}
