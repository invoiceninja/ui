/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ActionCard } from '@invoiceninja/cards';
import { Button } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Props {
  endpoint: string;
}

export function Clone(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return (
    <ActionCard label={t('clone')} help="Lorem ipsum dolor sit amet.">
      <Button onClick={() => navigate(props.endpoint)}>{t('clone')}</Button>
    </ActionCard>
  );
}
