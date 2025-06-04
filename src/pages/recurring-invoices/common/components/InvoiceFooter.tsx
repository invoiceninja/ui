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
import { useColorScheme } from '$app/common/colors';

interface Props {
  handleChange: ChangeHandler;
  errors: ValidationBag | undefined;
}

export function InvoiceFooter(props: Props) {
  const [t] = useTranslation();

  const { handleChange } = props;

  const colors = useColorScheme();

  const [recurringInvoice] = useAtom(recurringInvoiceAtom);

  const tabs = [t('public_notes'), t('private_notes'), t('terms'), t('footer')];

  return (
    <Card
      className="col-span-12 xl:col-span-8 shadow-sm h-max"
      style={{ borderColor: colors.$24 }}
    >
      <TabGroup
        tabs={tabs}
        withoutVerticalMargin
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
        fullRightPadding
      >
        <div className="mb-4 px-6">
          <MarkdownEditor
            value={recurringInvoice?.public_notes}
            onChange={(value) => handleChange('public_notes', value)}
          />
        </div>

        <div className="mb-4 px-6">
          <MarkdownEditor
            value={recurringInvoice?.private_notes}
            onChange={(value) => handleChange('private_notes', value)}
          />
        </div>

        <div className="mb-4 px-6">
          <MarkdownEditor
            value={recurringInvoice?.terms}
            onChange={(value) => handleChange('terms', value)}
          />
        </div>

        <div className="mb-4 px-6">
          <MarkdownEditor
            value={recurringInvoice?.footer}
            onChange={(value) => handleChange('footer', value)}
          />
        </div>
      </TabGroup>
    </Card>
  );
}
