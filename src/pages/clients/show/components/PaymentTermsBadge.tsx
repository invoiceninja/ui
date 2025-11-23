import { Badge } from '$app/components/Badge';
import { Tooltip } from '$app/components/Tooltip';
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
    <Tooltip
      message={t('payment_terms') as string}
      width="auto"
      withoutArrow
      placement="bottom"
      centerVertically
    >
      <Badge variant="dark-blue">
        {payment_terms} {t('days')}
      </Badge>
    </Tooltip>
  );
}
