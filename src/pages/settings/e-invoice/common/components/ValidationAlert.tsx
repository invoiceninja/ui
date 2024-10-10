/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Alert } from '$app/components/Alert';
import { Link } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdWarning } from 'react-icons/md';

interface Props {
  className?: string;
  to: string;
  entity: 'company' | 'client' | 'invoice';
}

export function ValidationAlert(props: Props) {
  const [t] = useTranslation();

  const { to, entity } = props;

  return (
    <Alert className="mb-4" type="warning" disableClosing>
      <div className="flex items-center space-x-10">
        <div className="flex items-center space-x-2">
          <Icon element={MdWarning} size={20} color="#eab308" />

          {entity === 'company' && (
            <span>{t('Company details are invalid or missing.')}</span>
          )}

          {entity === 'client' && (
            <span>{t('Client details are invalid or missing.')}</span>
          )}
        </div>

        {entity === 'company' && <Link to={to}>{t('Edit Company')}</Link>}

        {entity === 'client' && <Link to={to}>{t('Edit Client')}</Link>}
      </div>
    </Alert>
  );
}
