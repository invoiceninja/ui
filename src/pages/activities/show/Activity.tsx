/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { Default } from '$app/components/layouts/Default';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function Activity() {
  const { id } = useParams();
  const { t } = useTranslation();

  return (
    <Default title={t('activity')}>
      <InvoiceViewer
        link={endpoint(`/api/v1/activities/download_entity/${id}`)}
        method="GET"
      />
    </Default>
  );
}
