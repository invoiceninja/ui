/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, Link } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';

interface Props {
  blobUrl: string;
}

export function Actions(props: Props) {
  const [t] = useTranslation();
  console.log(props);

  return (
    <>
      <Link to="/delivery_note">{t('delivery_note')}</Link>

      <Button type="secondary">{t('email')}</Button>

      <Button type="secondary" onClick={() => window.open(props.blobUrl)}>
        {t('download')}
      </Button>

      <Button type="secondary">{t('close')}</Button>
    </>
  );
}
