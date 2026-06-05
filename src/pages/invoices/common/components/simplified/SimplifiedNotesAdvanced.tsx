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
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { Invoice } from '$app/common/interfaces/invoice';
import { Link } from '$app/components/forms';
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
  const colors = useColorScheme();
  const { isAdmin, isOwner } = useAdmin();

  const hasAny = Boolean(invoice?.public_notes || invoice?.private_notes);

  const collapsedHint = hasAny
    ? [
        invoice?.public_notes ? t('public_notes') : null,
        invoice?.private_notes ? t('private_notes') : null,
      ]
        .filter(Boolean)
        .join(' • ')
    : t('optional');

  const tabs = [
    t('public_notes'),
    t('private_notes'),
    ...(isAdmin || isOwner ? [t('custom_fields')] : []),
  ];

  return (
    <CollapsibleSection
      section="notes"
      title={t('notes')}
      subtitle={t('optional')}
      collapsedHint={collapsedHint}
      autoOpen={hasAny}
    >
      <TabGroup tabs={tabs} withoutVerticalMargin>
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

        <div className="pt-3 text-sm" style={{ color: colors.$3 }}>
          <span>{t('custom_fields')} &nbsp;</span>

          <Link to="/settings/custom_fields/invoices" className="capitalize">
            {t('click_here')}
          </Link>
        </div>
      </TabGroup>
    </CollapsibleSection>
  );
}
