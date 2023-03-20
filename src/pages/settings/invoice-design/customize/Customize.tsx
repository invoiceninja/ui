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
import { useTitle } from '$app/common/hooks/useTitle';
import { useDesignsQuery } from '$app/common/queries/designs';
import { Default } from '$app/components/layouts/Default';
import { TabGroup } from '$app/components/TabGroup';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import {
  payloadAtom,
} from '$app/pages/settings/invoice-design/customize/common/hooks';
import { Settings } from '$app/pages/settings/invoice-design/customize/components/Settings';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function Customize() {
  const [t] = useTranslation();
  const [payload, setPayload] = useAtom(payloadAtom);

  const { documentTitle } = useTitle('customize_and_preview');
  const { data: designs } = useDesignsQuery();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('invoice_design'), href: '/settings/invoice_design' },
    { name: t('customize_and_preview'), href: '/settings/design/customize' },
  ];

  useEffect(() => {
    if (designs) {
      setPayload(
        (current) =>
          current && { ...current, design: { ...designs[0], id: '-1' } }
      );
    }
  }, [designs]);

  useEffect(() => {
    if (payload?.design) {
      // ..
    }
  }, [payload?.design]);

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5">
          <TabGroup tabs={[t('settings'), t('body')]}>
            <Settings payload={payload} />

            <div>Body</div>
          </TabGroup>
        </div>

        <div className="col-span-12 lg:col-span-7">
          {payload?.design && (
            <InvoiceViewer
              link={endpoint('/api/v1/preview')}
              resource={payload}
              method="POST"
              withToast
            />
          )}
        </div>
      </div>
    </Default>
  );
}
