import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';

interface Props {
  isTaxExempt: boolean;
}

export function TaxExemptBadge({ isTaxExempt }: Props) {
  const [t] = useTranslation();

  if (!isTaxExempt) {
    return null;
  }

  return <Badge variant="orange">{t('tax_exempt')}</Badge>;
}
