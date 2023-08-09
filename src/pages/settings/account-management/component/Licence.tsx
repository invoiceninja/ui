/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Divider } from '$app/components/cards/Divider';
import { Modal } from '$app/components/Modal';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClickableElement } from '../../../../components/cards';
import { toast } from '$app/common/helpers/toast/toast';

export function License() {
  const [t] = useTranslation();
  const link = import.meta.env.VITE_WHITELABEL_INVOICE_URL as unknown as string;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const formik = useFormik({
    initialValues: {
      license: '',
    },
    onSubmit: (values) => {
      toast.processing();

      request(
        'POST',
        endpoint('/api/v1/claim_license?license_key=:key', {
          key: values.license,
        })
      )
        .then(() => {
          toast.success('bought_white_label');

          setIsModalVisible(false);
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
