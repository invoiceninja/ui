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
import { WorkRow, WorkSource, loadWorkRows } from '../helpers/work-rows';

interface Props {
  open: boolean;
  source: WorkSource;
  clientId: string;
  exclude?: string[];
  onClose: () => void;
  onPick: (item: InvoiceItem) => void;
}

export function WorkPicker({
  open,
  source,
  clientId,
  exclude = [],
  onClose,
  onPick,
}: Props) {
  const colors = useColorScheme();
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();

  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<WorkRow[]>([]);
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

    loadWorkRows(source, query, clientId)
      .then((result) => !cancelled && setRows(result))
      .catch(() => !cancelled && setRows([]))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [open, source, query, clientId]);

  const visible = rows.filter((row) => !exclude.includes(row.id));

  return (
    <Modal
      visible={open}
      onClose={onClose}
      title={source === 'saved' ? t('products') : t('unbilled_work')}
      size="small"
    >
      {source === 'saved' ? (
        <div className="mb-3">
          <InputField
            id="iw-item-search"
            placeholder={t('search_products')}
            value={query}
            changeOverride
            onValueChange={setQuery}
          />
        </div>
      ) : null}

      {loading ? (
        <div className="py-10 flex justify-center">
          <Spinner />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm py-10 text-center" style={{ color: colors.$17 }}>
          {t(emptyCopy(source, Boolean(clientId)))}
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((row) => (
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

                {row.detail || row.tag ? (
                  <span
                    className="block text-xs mt-0.5"
                    style={{ color: colors.$17 }}
                  >
                    {[row.tag ? t(row.tag) : '', row.detail]
                      .filter(Boolean)
                      .join(' · ')}
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

const emptyCopy = (source: WorkSource, hasClient: boolean): string => {
  if (source === 'saved') {
    return 'no_saved_products';
  }

  if (!hasClient) {
    return 'please_select_a_client';
  }

  return 'empty_table';
};
