/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { Mailer } from '$app/pages/invoices/email/components/Mailer';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePurchaseOrderQuery } from '../common/queries';

export interface MailerComponent {
  sendEmail: () => unknown;
}

export function Email() {
  const [t] = useTranslation();

  const mailerRef = useRef<MailerComponent>(null);

  const { documentTitle } = useTitle('email_purchase_order');
  const { id } = useParams();

  const { data: purchaseOrder } = usePurchaseOrderQuery({ id });

  const list = {
    email_template_purchase_order: 'initial_email',
  };

  const pages: Page[] = [
    { name: t('purchase_orders'), href: '/purchase_orders' },
    {
      name: t('purchase_order'),
      href: route('/purchase_orders/:id', { id }),
    },
    {
      name: t('email_purchase_order'),
      href: route('/purchase_orders/:id/email', { id }),
    },
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      saveButtonLabel={t('send_email')}
      onSaveClick={() => mailerRef?.current?.sendEmail()}
    >
      {purchaseOrder && (
        <Mailer
          ref={mailerRef}
          resource={purchaseOrder}
          resourceType="purchase_order"
          list={list}
          defaultEmail="email_template_purchase_order"
          redirectUrl="/purchase_orders"
        />
      )}
    </Default>
  );
}
