/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { Invoice } from '$app/common/interfaces/invoice';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import Toggle from '$app/components/forms/Toggle';
import { ChangeHandler } from '$app/pages/invoices/create/Create';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsibleSection } from './CollapsibleSection';

interface Props {
  invoice?: Invoice;
  handleChange: ChangeHandler;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
}

export function SimplifiedFooterCard({
  invoice,
  handleChange,
  isDefaultFooter,
  setIsDefaultFooter,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const hasFooter = Boolean(invoice?.footer);

  return (
    <CollapsibleSection
      section="footer"
      title={t('footer')}
      subtitle={t('optional')}
      autoOpen={hasFooter}
    >
      <div className="flex flex-col gap-y-4">
        <MarkdownEditor
          value={invoice?.footer || ''}
          onChange={(value) => handleChange('footer', value)}
        />

        <label className="flex items-center gap-x-2 cursor-pointer">
          <Toggle
            checked={isDefaultFooter}
            onValueChange={(value) => setIsDefaultFooter(value)}
          />

          <span className="text-sm font-medium" style={{ color: colors.$3 }}>
            {t('save_as_default_footer')}
          </span>
        </label>
      </div>
    </CollapsibleSection>
  );
}
