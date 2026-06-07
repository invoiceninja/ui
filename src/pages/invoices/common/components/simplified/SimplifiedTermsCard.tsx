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
import { SimplifiedCard } from './SimplifiedCard';

interface Props {
  invoice?: Invoice;
  handleChange: ChangeHandler;
  isDefaultTerms: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
}

export function SimplifiedTermsCard({
  invoice,
  handleChange,
  isDefaultTerms,
  setIsDefaultTerms,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <SimplifiedCard title={t('terms')}>
      <MarkdownEditor
        value={invoice?.terms || ''}
        onChange={(value) => handleChange('terms', value)}
      />

      <label className="flex items-center gap-x-2 cursor-pointer">
        <Toggle
          checked={isDefaultTerms}
          onValueChange={(value) => setIsDefaultTerms(value)}
        />

        <span className="text-sm font-medium" style={{ color: colors.$3 }}>
          {t('save_as_default_terms')}
        </span>
      </label>
    </SimplifiedCard>
  );
}
