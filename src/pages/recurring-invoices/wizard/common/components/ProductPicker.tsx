/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useColorScheme } from '$app/common/colors';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import { InputField } from '$app/components/forms';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductRow, loadProductRows } from '../helpers/product-rows';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (item: InvoiceItem) => void;
}

export function ProductPicker({ open, onClose, onPick }: Props) {
  const colors = useColorScheme();
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();

  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    setLoading(true);

    loadProductRows(query)
      .then((result) => !cancelled && setRows(result))
      .catch(() => !cancelled && setRows([]))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [open, query]);

  return (
    <Modal visible={open} onClose={onClose} title={t('products')} size="small">
      <div className="mb-3">
        <InputField
          id="iw-item-search"
          placeholder={t('search_products')}
          value={query}
          changeOverride
          onValueChange={setQuery}
        />
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm py-10 text-center" style={{ color: colors.$17 }}>
          {t('no_saved_products')}
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => {
                onPick(row.build());
                onClose();
              }}
              className="w-full text-left px-3.5 py-3 flex items-start justify-between gap-4 border"
              style={{
                borderColor: colors.$24,
                borderRadius: '0.375rem',
                backgroundColor: colors.$1,
              }}
              onMouseEnter={(event) =>
                (event.currentTarget.style.backgroundColor = colors.$25)
              }
              onMouseLeave={(event) =>
                (event.currentTarget.style.backgroundColor = colors.$1)
              }
            >
              <div className="min-w-0">
                <span className="block text-sm" style={{ color: colors.$3 }}>
                  {row.title}
                </span>

                {row.detail ? (
                  <span
                    className="block text-xs mt-0.5"
                    style={{ color: colors.$17 }}
                  >
                    {row.detail}
                  </span>
                ) : null}
              </div>

              <span
                className="text-sm shrink-0"
                style={{
                  color: colors.$3,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatMoney(row.amount, undefined, undefined, 2)}
              </span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
