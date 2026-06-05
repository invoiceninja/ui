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
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  invoice?: Invoice;
  handleChange: ChangeHandler;
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
}

interface CardProps {
  title: ReactNode;
  children: ReactNode;
}

function Card({ title, children }: CardProps) {
  const colors = useColorScheme();

  return (
    <div
      className="border rounded-md flex flex-col"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: colors.$24 }}
      >
        <span className="text-sm font-semibold" style={{ color: colors.$3 }}>
          {title}
        </span>
      </div>

      <div className="px-6 py-4 flex-1 flex flex-col gap-y-4">{children}</div>
    </div>
  );
}

export function SimplifiedTermsFooter({
  invoice,
  handleChange,
  isDefaultTerms,
  isDefaultFooter,
  setIsDefaultTerms,
  setIsDefaultFooter,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title={t('terms')}>
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
      </Card>

      <Card title={t('footer')}>
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
      </Card>
    </div>
  );
}
