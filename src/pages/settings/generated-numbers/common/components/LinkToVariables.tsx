/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';

export function LinkToVariables() {
  const [t] = useTranslation();

  return (
    <Link
      className="pl-6"
      to="https://invoiceninja.github.io/docs/custom-fields/#custom-fields"
      external
    >
      {t('click_to_variables')}
    </Link>
  );
}
