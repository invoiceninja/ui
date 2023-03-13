/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

export function Backup() {
  const [t] = useTranslation();

  const handleExportCompany = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    toast.processing();

    request('POST', endpoint('/api/v1/export'), {
      send_email: true,
      report_keys: [],
    })
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.error(error);
        toast.error();
      });
  };

  return (
    <Card>
      <Element leftSide={t('export_company')} leftSideHelp={t('exported_data')}>
        <Button onClick={handleExportCompany}>{t('export')}</Button>
      </Element>
    </Card>
  );
}
