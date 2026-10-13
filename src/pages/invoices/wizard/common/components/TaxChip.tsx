/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { formatTaxName } from '$app/common/helpers/invoices/round';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { TaxRate } from '$app/common/interfaces/tax-rate';
import { useTranslation } from 'react-i18next';
import { TAX_FIELDS, TaxSlot } from '../helpers/tax-slots';
import { ChipMenu } from './ChipMenu';
import { ChipOption } from './ChipOption';

interface Props {
  item: InvoiceItem;
  slot: TaxSlot;
  rates: TaxRate[];
  onChange: (changes: Partial<InvoiceItem>) => void;
  onCreate: () => void;
}

export function TaxChip({ item, slot, rates, onChange, onCreate }: Props) {
  const colors = useColorScheme();
  const [t] = useTranslation();

  const field = TAX_FIELDS[slot];
  const name = item[field.name] ?? '';
  const rate = item[field.rate] ?? 0;
  const applied = Boolean(name);

  return (
    <ChipMenu
      applied={applied}
      label={applied ? formatTaxName(name, rate) : t('add_tax')}
    >
      <div className="overflow-y-auto" role="listbox">
        {applied ? (
          <ChipOption
            onClick={() => onChange({ [field.name]: '', [field.rate]: 0 })}
          >
            {t('none')}
          </ChipOption>
        ) : null}

        {rates.map((entry) => (
          <ChipOption
            key={entry.id ?? entry.name}
            selected={applied && name === entry.name}
            onClick={() =>
              onChange({ [field.name]: entry.name, [field.rate]: entry.rate })
            }
          >
            {formatTaxName(entry.name, entry.rate)}
          </ChipOption>
        ))}
      </div>

      <div
        className="shrink-0"
        style={{ borderTop: `1px solid ${colors.$20}` }}
      >
        <ChipOption onClick={onCreate} muted>
          {t('create_tax_rate')}
        </ChipOption>
      </div>
    </ChipMenu>
  );
}
