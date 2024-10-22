/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { Country } from '$app/common/interfaces/country';
import { SelectField } from '$app/components/forms';
import { useEffect, useState } from 'react';

interface Props {
  countryId: string;
}

export function EURegionSelector(props: Props) {
  const { countryId } = props;

  const resolveCountry = useResolveCountry();

  const companyChanges = useCompanyChanges();

  const [country, setCountry] = useState<Country>();

  useEffect(() => {
    const resolvedCountry = resolveCountry(countryId);

    setCountry(resolvedCountry);
  }, [countryId]);

  if (!country) return null;

  return (
    <div className="flex flex-col">
      <SelectField value={companyChanges} customSelector></SelectField>
    </div>
  );
}
