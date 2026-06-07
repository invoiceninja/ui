/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { TabGroup } from '$app/components/TabGroup';
import { ChangeHandler } from '$app/pages/invoices/create/Create';
import { useTranslation } from 'react-i18next';
import { CollapsibleSection } from './CollapsibleSection';

interface Props {
  invoice?: Invoice;
  handleChange: ChangeHandler;
}

export function SimplifiedNotesAdvanced({ invoice, handleChange }: Props) {
  const [t] = useTranslation();

  const hasAny = Boolean(invoice?.public_notes || invoice?.private_notes);

  return (
    <CollapsibleSection
      section="notes"
      title={t('notes')}
      subtitle={t('optional')}
      autoOpen={hasAny}
    >
      <TabGroup
        tabs={[t('public_notes'), t('private_notes')]}
        withoutVerticalMargin
      >
        <div className="pt-2">
          <MarkdownEditor
            value={invoice?.public_notes || ''}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div className="pt-2">
          <MarkdownEditor
            value={invoice?.private_notes || ''}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>
      </TabGroup>
    </CollapsibleSection>
  );
}
