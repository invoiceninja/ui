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
import { useQuoteQuery } from '../common/queries';

export function Email() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('email_quote');
  const { id } = useParams();

  const { data: quote } = useQuoteQuery({ id: id! });

  const [templateId, setTemplateId] = useState<string>('email_template_quote');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const list = {
    email_template_quote: 'initial_email',
  };

  const pages: Page[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('email_quote'),
      href: route('/quotes/:id/email', { id }),
    },
  ];

  const handleSend = useHandleSend();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      disableSaveButton={!quote}
      saveButtonLabel={t('send_email')}
      onSaveClick={() =>
        quote &&
        handleSend(body, 'quote', quote.id, subject, templateId, '/quotes')
      }
    >
      {quote && (
        <Mailer
          resource={quote}
          resourceType="quote"
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
