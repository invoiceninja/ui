/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { Card, Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Downgrade() {
  const { t } = useTranslation();

  return (
    <Card title={t('downgrade')}>
      <Element leftSide={t('downgrade_to_free')}>
        {t('downgrade_to_free_description')} <Popup />
      </Element>
    </Card>
  );
}

function Popup() {
  const { t } = useTranslation();
  const accentColor = useAccentColor();
  const refresh = useRefreshCompanyUsers();

  const [isVisible, setIsVisible] = useState(false);

  const form = useFormik({
    initialValues: {},
    onSubmit: (_, { setSubmitting }) => {
      toast.processing();

      request('POST', endpoint('/api/client/account_management/free'))
        .then(() => {
          toast.success();

          refresh();
          setIsVisible(false);
        })
        .catch(() => toast.error())
        .finally(() => setSubmitting(false));
    },
  });

  return (
    <>
      <button
        type="button"
        style={{ color: accentColor }}
        onClick={() => setIsVisible(true)}
      >
        {t('downgrade')}
      </button>

      <Modal
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        title={t('downgrade')}
        disableClosing={form.isSubmitting}
      >
        <p>{t('downgrade_to_free_description')}</p>

        <form onSubmit={form.handleSubmit}>
          <div className="flex justify-end">
            <Button disabled={form.isSubmitting}>{t('continue')}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
