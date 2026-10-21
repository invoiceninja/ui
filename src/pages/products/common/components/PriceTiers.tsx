/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import { PriceTier } from '$app/common/interfaces/product';
import { Button, SelectField } from '$app/components/forms';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { Icon } from '$app/components/icons/Icon';
import { useColorScheme } from '$app/common/colors';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';

interface Props {
  tiers: PriceTier[];
  mode: string;
  productPrice: number;
  onChange: (tiers: PriceTier[]) => void;
}

export function PriceTiers(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const formatMoney = useFormatMoney();

  const { tiers, mode, productPrice, onChange } = props;

  const progressive = mode === 'progressive';

  const sorted = (list: PriceTier[]) =>
    [...list].sort(
      (a, b) => (Number(a.min_quantity) || 0) - (Number(b.min_quantity) || 0)
    );

  const updateTier = (index: number, tier: PriceTier) => {
    onChange(
      sorted(
        tiers.map((current, tierIndex) => (tierIndex === index ? tier : current))
      )
    );
  };

  const removeTier = (index: number) => {
    onChange(tiers.filter((_, tierIndex) => tierIndex !== index));
  };

  const addTier = () => {
    onChange(sorted([...tiers, { min_quantity: 0, price: 0 }]));
  };

  const setTierType = (index: number, type: 'price' | 'discount') => {
    const tier = tiers[index];

    const value = tier.price ?? tier.discount ?? 0;

    updateTier(
      index,
      type === 'price'
        ? { min_quantity: tier.min_quantity, price: value }
        : { min_quantity: tier.min_quantity, discount: value }
    );
  };

  /* Rate of a single tier */
  const tierRate = (tier: PriceTier): number =>
    'price' in tier
      ? tier.price ?? 0
      : productPrice * (1 - (tier.discount ?? 0) / 100);

  /* Blended unit price when ordering exactly `quantity` units
   * (progressive mode only, mirrors ApplyPriceTiers::progressiveCost) */
  const blendedPrice = (quantity: number): number => {
    if (quantity <= 0) {
      return productPrice;
    }

    let total = 0;
    let lower = 0;
    let rate = productPrice;

    for (const tier of sorted(tiers)) {
      const boundary = Math.max(0, (Number(tier.min_quantity) || 0) - 1);

      if (boundary >= quantity) {
        break;
      }

      if (boundary > lower) {
        total += (boundary - lower) * rate;
        lower = boundary;
      }

      rate = tierRate(tier);
    }

    total += (quantity - lower) * rate;

    return total / quantity;
  };

  /* Bracket covered by the tier at `index`, e.g. "10–49" or "50+" */
  const bracketLabel = (index: number): string => {
    const min = Number(tiers[index].min_quantity) || 0;
    const next = Number(tiers[index + 1]?.min_quantity) || null;

    return next ? `${min}–${next - 1}` : `${min}+`;
  };

  const preview = (tier: PriceTier, index: number): string => {
    if (!progressive) {
      return String(formatMoney(tierRate(tier), undefined, undefined));
    }

    const min = Number(tier.min_quantity) || 0;

    return `${bracketLabel(index)} · Ø ${formatMoney(
      blendedPrice(min),
      undefined,
      undefined
    )}`;
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      {tiers.length > 0 && (
        <div
          className="flex items-center gap-2 text-xs font-medium"
          style={{ color: colors.$3, opacity: 0.6 }}
        >
          <span className="w-24">{t('min_quantity')}</span>
          <span className="w-28">{t('type')}</span>
          <span className="w-28">{t('value')}</span>
          <span className="flex-1">
            {progressive ? t('avg_price_at_min') : t('effective_price')}
          </span>
          <span className="w-5" />
        </div>
      )}

      {progressive &&
        tiers.length > 0 &&
        (Number(tiers[0].min_quantity) || 0) > 1 && (
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.$3, opacity: 0.6 }}>
            <span className="w-24">{t('base_price')}</span>
            <span className="w-28">—</span>
            <span className="w-28">{formatMoney(productPrice, undefined, undefined)}</span>
            <span className="flex-1">
              {`1–${(Number(tiers[0].min_quantity) || 0) - 1}`}
            </span>
            <span className="w-5" />
          </div>
        )}

      {tiers.map((tier, index) => {
        const type = 'price' in tier ? 'price' : 'discount';

        return (
          <div key={index} className="flex items-center gap-2">
            <div className="w-24">
              <NumberInputField
                value={tier.min_quantity || ''}
                precision={0}
                placeholder="0"
                onValueChange={(value) =>
                  updateTier(index, {
                    ...tier,
                    min_quantity: parseFloat(value) || 0,
                  })
                }
                withoutLabelWrapping
              />
            </div>

            <div className="w-28">
              <SelectField
                value={type}
                onValueChange={(value) =>
                  setTierType(index, value as 'price' | 'discount')
                }
                customSelector
                dismissable={false}
              >
                <option value="price">{t('price')}</option>
                <option value="discount">{t('discount_percent')}</option>
              </SelectField>
            </div>

            <div className="w-28">
              <NumberInputField
                value={(tier.price ?? tier.discount) || ''}
                onValueChange={(value) =>
                  updateTier(index, {
                    ...tier,
                    [type]: parseFloat(value) || 0,
                  })
                }
                withoutLabelWrapping
              />
            </div>

            <span className="flex-1 text-sm" style={{ color: colors.$3 }}>
              {preview(tier, index)}
            </span>

            <Icon
              element={MdDeleteOutline}
              className="cursor-pointer"
              style={{ color: colors.$3 }}
              onClick={() => removeTier(index)}
            />
          </div>
        );
      })}

      <div className="pt-1">
        <Button type="secondary" behavior="button" onClick={addTier}>
          <span className="flex items-center gap-1">
            <Icon element={MdAdd} size={18} />
            {t('add_tier')}
          </span>
        </Button>
      </div>

      <p className="text-xs" style={{ color: colors.$3, opacity: 0.6 }}>
        {progressive
          ? t('price_tiers_help_progressive')
          : t('price_tiers_help_all_units')}
      </p>
    </div>
  );
}
