/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Product } from 'common/interfaces/product';
import { Badge } from 'components/Badge';
import { useTranslation } from 'react-i18next';

interface Props {
  product: Product;
}

export function Status(props: Props) {
  const [t] = useTranslation();

  if (!props.product.is_deleted && !props.product.archived_at) {
    return <Badge variant="primary">{t('active')}</Badge>;
  }

  if (props.product.archived_at && !props.product.is_deleted) {
    return <Badge variant="yellow">{t('archived')}</Badge>;
  }

  if (props.product.is_deleted) {
    return <Badge variant="red">{t('deleted')}</Badge>;
  }

  return <></>;
}
