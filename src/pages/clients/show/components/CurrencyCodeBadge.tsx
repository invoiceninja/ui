import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Badge } from '$app/components/Badge';
import { Tooltip } from '$app/components/Tooltip';
import { useTranslation } from 'react-i18next';

interface Props {
  currency_id: string | undefined;
}

export function CurrencyCodeBadge({ currency_id }: Props) {
  const [t] = useTranslation();

  const resolveCurrency = useResolveCurrency();

  if (!currency_id) {
    return null;
  }

  return (
    <Tooltip
      message={t('currency') as string}
      width="auto"
      withoutArrow
      placement="bottom"
      centerVertically
    >
      <Badge variant="green">{resolveCurrency(currency_id)?.code}</Badge>
    </Tooltip>
  );
}
