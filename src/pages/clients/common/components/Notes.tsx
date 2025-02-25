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
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { ClientContext } from '../../edit/Edit';
import { Client } from '$app/common/interfaces/client';

export default function Notes() {
  const [t] = useTranslation();

  const context: ClientContext = useOutletContext();

  const { client, setClient } = context;

  const handleChange = <T extends keyof Client>(
    property: T,
    value: Client[typeof property]
  ) => {
    setClient((client) => client && { ...client, [property]: value });
  };

  return (
    <Card title={t('notes')}>
      <Element leftSide={t('public_notes')}>
        <MarkdownEditor
          value={client?.public_notes}
          onChange={(value) => handleChange('public_notes', value)}
        />
      </Element>

      <Element leftSide={t('private_notes')}>
        <MarkdownEditor
          value={client?.private_notes}
          onChange={(value) => handleChange('private_notes', value)}
        />
      </Element>
    </Card>
  );
}
