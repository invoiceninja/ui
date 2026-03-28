/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import { useDispatch } from 'react-redux';
import {
  DashboardCardField,
  CompanyUser,
} from '$app/common/interfaces/company-user';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { updateUser } from '$app/common/stores/slices/user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { DashboardCard } from './DashboardCard';

interface Props {
  fields: DashboardCardField[];
  dateRange: string;
  startDate: string;
  endDate: string;
  currencyId: string;
}

/** Max 4 columns on desktop, scales down by container width. */
function colsFromWidth(w: number): number {
  if (w >= 1280) return 4;
  if (w >= 1024) return 3;
  if (w >= 640) return 2;
  return 1;
}

export function PreferenceCardsGrid({
  fields,
  dateRange,
  startDate,
  endDate,
  currencyId,
}: Props) {
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const reactSettings = useReactSettings();
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Responsive columns ────────────────────────────────────────────────────
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setCols(colsFromWidth(e.contentRect.width))
    );
    ro.observe(el);
    setCols(colsFromWidth(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  const [order, setOrder] = useState<string[]>(() => fields.map((f) => f.id));

  useEffect(() => {
    const ids = fields.map((f) => f.id);
    const saved = reactSettings.preference_cards_order ?? [];
    const valid = saved.filter((id) => ids.includes(id));
    const appended = ids.filter((id) => !valid.includes(id));
    setOrder([...valid, ...appended]);
  }, [fields.length]);

  useDebounce(
    () => {
      if (!user) return;
      const saved = reactSettings.preference_cards_order;
      if (JSON.stringify(saved) === JSON.stringify(order)) return;

      request('PUT', endpoint('/api/v1/company_users/:id', { id: user.id }), {
        react_settings: { ...reactSettings, preference_cards_order: order },
      }).then((r: GenericSingleResourceResponse<CompanyUser>) => {
        dispatch(updateUser({ ...user, company_user: r.data.data }));
        $refetch(['company_users']);
      });
    },
    1500,
    [order]
  );

  const dragId = useRef<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDragEnter = (index: number) => setOverIndex(index);

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const src = dragId.current;
    if (!src) return;

    setOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(src);
      if (from === -1 || from === dropIndex) return prev;
      next.splice(from, 1);
      next.splice(dropIndex, 0, src);
      return next;
    });

    dragId.current = null;
    setOverIndex(null);
  };

  const onDragEnd = () => {
    dragId.current = null;
    setOverIndex(null);
  };

  // ── Ordered field list ────────────────────────────────────────────────────
  const fieldMap = Object.fromEntries(fields.map((f) => [f.id, f]));
  const ordered = order
    .map((id) => fieldMap[id])
    .filter((f): f is DashboardCardField => Boolean(f));

  // Card width: 1/cols of row minus gap proportional share
  const GAP = 1; // rem — must match the gap below
  const cardWidth = `calc(${100 / cols}% - ${((cols - 1) / cols) * GAP}rem)`;

  if (ordered.length === 0) return null;

  return (
    <div ref={containerRef} className="w-full">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${GAP}rem` }}>
        {ordered.map((field, index) => (
          <div
            key={field.id}
            draggable
            onDragStart={(e) => onDragStart(e, field.id)}
            onDragOver={onDragOver}
            onDragEnter={() => onDragEnter(index)}
            onDragLeave={() => setOverIndex(null)}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={onDragEnd}
            className={classNames(
              'transition-all duration-150 cursor-grab active:cursor-grabbing',
              {
                'opacity-40': dragId.current === field.id,
                'ring-2 ring-primary-400 ring-offset-2 rounded-lg':
                  overIndex === index && dragId.current !== field.id,
              }
            )}
            style={{ width: cardWidth, minWidth: '180px', height: '130px' }}
          >
            <DashboardCard
              field={field}
              dateRange={dateRange}
              startDate={startDate}
              endDate={endDate}
              currencyId={currencyId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
