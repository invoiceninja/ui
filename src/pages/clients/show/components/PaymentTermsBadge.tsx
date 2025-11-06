import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';

interface Props {
  payment_terms: string | undefined;
}

export function PaymentTermsBadge({ payment_terms }: Props) {
  const [t] = useTranslation();

  if (!payment_terms) {
    return null;
  }

  return (
    <Badge variant="dark-blue">
      {payment_terms} {t('days')}
    </Badge>
  );
}
