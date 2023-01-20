/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { useHandleSend } from 'common/hooks/emails/useHandleSend';
import { useTitle } from 'common/hooks/useTitle';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Mailer } from 'pages/invoices/email/components/Mailer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePurchaseOrderQuery } from '../common/queries';

export function Email() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('email_purchase_order');
  const { id } = useParams();

  const { data: purchaseOrder } = usePurchaseOrderQuery({ id });

  const [templateId, setTemplateId] = useState<string>(
    'email_template_purchase_order'
  );
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');

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

  const handleSend = useHandleSend();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      disableSaveButton={!purchaseOrder}
      saveButtonLabel={t('send_email')}
      onSaveClick={() =>
        purchaseOrder &&
        handleSend(
          body,
          'purchase_order',
          purchaseOrder.id,
          subject,
          templateId,
          '/purchase_orders'
        )
      }
    >
      {purchaseOrder && (
        <Mailer
          resource={purchaseOrder}
          resourceType="purchase_order"
          list={list}
          body={body}
          setBody={setBody}
          subject={subject}
          setSubject={setSubject}
          templateId={templateId}
          setTemplateId={setTemplateId}
        />
      )}
    </Default>
  );
}
