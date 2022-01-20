/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { useTitle } from 'common/hooks/useTitle';
import { useClientQuery } from 'common/queries/clients';
import { Default } from 'components/layouts/Default';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Edit() {
  const { documentTitle, setDocumentTitle } = useTitle('edit_client');

  const [t] = useTranslation();
  const { id } = useParams();
  const { data: client } = useClientQuery({ id });

  useEffect(() => {
    setDocumentTitle(client?.data?.data?.display_name || 'edit_client');
  }, [client]);

  return (
    <Default title={documentTitle}>
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-6" title={t('details')}>
          {/*  */}
        </Card>

        <Card className="col-span-6" title={t('details')}>
          {/*  */}
        </Card>
      </div>
    </Default>
  );
}
