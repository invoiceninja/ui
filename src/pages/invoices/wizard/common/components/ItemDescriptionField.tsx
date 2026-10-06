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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Product } from '$app/common/interfaces/product';
import { InputField } from '$app/components/forms';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  id: string;
  value: string;
  errorMessage?: string | string[];
  onChange: (value: string) => void;
  onPick: (product: Product) => void;
}

export function ItemDescriptionField({
  id,
  value,
  errorMessage,
  onChange,
  onPick,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const formatMoney = useFormatMoney();

  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<Product[]>([]);
  const [active, setActive] = useState(-1);

  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = `${id}-products`;

  useEffect(() => {
    const term = query.trim();

    if (term.length < 2) {
      setMatches([]);
      setActive(-1);

      return;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      request(
        'GET',
        endpoint(
          '/api/v1/products?status=active&per_page=5&sort=product_key|asc&filter=:filter',
          { filter: encodeURIComponent(term) }
        ),
        {},
        { skipIntercept: true }
      )
        .then((response) => {
          if (cancelled) {
            return;
          }

          setMatches((response.data.data ?? []) as Product[]);
          setActive(-1);
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          setMatches([]);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const element = input.current;

    if (!element) {
      return;
    }

    element.setAttribute('role', 'combobox');
    element.setAttribute('aria-autocomplete', 'list');
    element.setAttribute('aria-controls', listId);
    element.setAttribute('aria-expanded', String(matches.length > 0));

    if (active >= 0 && matches[active]) {
      element.setAttribute('aria-activedescendant', `${listId}-${active}`);
    } else {
      element.removeAttribute('aria-activedescendant');
    }
  }, [matches, active]);

  const close = () => {
    setQuery('');
    setMatches([]);
    setActive(-1);
  };

  const pick = (product: Product) => {
    close();
    onPick(product);
  };

  return (
    <div
      ref={box}
      className="relative"
      onBlur={(event) => {
        if (!box.current?.contains(event.relatedTarget as Node)) {
          close();
        }
      }}
      onKeyDown={(event) => {
        if (!matches.length) {
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setActive((current) => (current + 1) % matches.length);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setActive((current) =>
            current <= 0 ? matches.length - 1 : current - 1
          );
        } else if (event.key === 'Enter' && matches[active]) {
          event.preventDefault();
          pick(matches[active]);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      }}
    >
      <InputField
        id={id}
        innerRef={input}
        width="100%"
        label={t('description')}
        placeholder={t('item_description')}
        value={value}
        changeOverride
        debounceTimeout={0}
        onValueChange={(next) => {
          if (next === value || next === value.replace(/[\r\n]/g, '')) {
            return;
          }

          onChange(next);
          setQuery(next);
        }}
        errorMessage={errorMessage}
      />

      {matches.length ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 mt-1.5 z-20 border overflow-hidden"
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$24,
            borderRadius: '0.375rem',
            boxShadow: '0 12px 32px -12px rgba(9,9,11,0.28)',
          }}
        >
          {matches.map((product, index) => (
            <button
              key={product.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={active === index}
              type="button"
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(product)}
              onMouseEnter={() => setActive(index)}
              className="w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3"
              style={{
                color: colors.$3,
                backgroundColor: active === index ? colors.$25 : 'transparent',
              }}
            >
              <div className="min-w-0">
                <span className="block text-sm truncate">
                  {product.product_key || product.notes}
                </span>

                {product.product_key && product.notes ? (
                  <span
                    className="block text-xs truncate"
                    style={{ color: colors.$17 }}
                  >
                    {product.notes}
                  </span>
                ) : null}
              </div>

              <span
                className="text-sm shrink-0"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatMoney(product.price, undefined, undefined, 2)}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
