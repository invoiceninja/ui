/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { TabGroup } from '$app/components/TabGroup';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { recurringInvoiceAtom } from '../atoms';
import { ChangeHandler } from '../hooks';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

interface Props {
  handleChange: ChangeHandler;
  errors: ValidationBag | undefined;
}

export function InvoiceFooter(props: Props) {
  const [recurringInvoice] = useAtom(recurringInvoiceAtom);

  const { t } = useTranslation();
  const { handleChange } = props;

  const tabs = [t('public_notes'), t('private_notes'), t('terms'), t('footer')];

  return (
    <Card className="col-span-12 xl:col-span-8 h-max px-6">
      <TabGroup tabs={tabs}>
        <div>
          <MarkdownEditor
            value={recurringInvoice?.public_notes}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={recurringInvoice?.private_notes}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={recurringInvoice?.terms}
            onChange={(value) => handleChange('terms', value)}
          />
        </div>

        <div>
          <MarkdownEditor
            value={recurringInvoice?.footer}
            onChange={(value) => handleChange('footer', value)}
          />
        </div>
      </TabGroup>
    </Card>
  );
}
