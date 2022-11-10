/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';
import { MdLink } from 'react-icons/md';

const ConnectAccounts = () => {
  const [t] = useTranslation();
  return (
    <Button>
      <span className="mr-2">{<MdLink />}</span>
      {t('connect_accounts')}
    </Button>
  );
};

export default ConnectAccounts;
