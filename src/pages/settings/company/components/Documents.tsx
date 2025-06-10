/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { ClickableElement } from '../../../../components/cards';

export function Documents() {
  const [t] = useTranslation();

  return (
    <>
      <ClickableElement to="/settings/company_details/documents">
        {t('default_documents')}
      </ClickableElement>
    </>
  );
}
