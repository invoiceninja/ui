/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useTranslation } from 'react-i18next';

export function Actions() {
  const [t] = useTranslation();

  return (
    <Dropdown label={t('more_actions')} className="divide-y">
      <div>
        <DropdownElement>{t('view_pdf')}</DropdownElement>
        <DropdownElement>{t('download')}</DropdownElement>
        <DropdownElement>{t('email_invoice')}</DropdownElement>
        <DropdownElement>{t('mark_paid')}</DropdownElement>
        <DropdownElement>{t('enter_payment')}</DropdownElement>
        <DropdownElement>{t('client_portal')}</DropdownElement>
      </div>

      <div>
        <DropdownElement>{t('clone_to_invoice')}</DropdownElement>
        <DropdownElement>{t('clone_to_other')}</DropdownElement>
      </div>

      <div>
        <DropdownElement>{t('cancel')}</DropdownElement>
        <DropdownElement>{t('reverse')}</DropdownElement>
        <DropdownElement>{t('archive')}</DropdownElement>
        <DropdownElement>{t('delete')}</DropdownElement>
      </div>
    </Dropdown>
  );
}
