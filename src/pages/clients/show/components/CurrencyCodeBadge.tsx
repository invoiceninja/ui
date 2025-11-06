import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { Badge } from '$app/components/Badge';

interface Props {
  currency_id: string | undefined;
}

export function CurrencyCodeBadge({ currency_id }: Props) {
  const resolveCurrency = useResolveCurrency();

  if (!currency_id) {
    return null;
  }

  return <Badge variant="green">{resolveCurrency(currency_id)?.code}</Badge>;
}
