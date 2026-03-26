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
import { DashboardField } from '$app/common/interfaces/company-user';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { updateUser } from '$app/common/stores/slices/user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { DashboardCard } from './DashboardCard';

interface Props {
  currentDashboardFields: DashboardField[];
  dateRange: string;
  startDate: string;
  endDate: string;
  currencyId: string;
  layoutBreakpoint: string | undefined;
  isEditMode: boolean;
}

function columnsFromWidth(width: number): number {
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export function PreferenceCardsGrid(props: Props) {
  const {
    currentDashboardFields,
    dateRange,
    startDate,
    endDate,
    currencyId,
    layoutBreakpoint,
    isEditMode,
  } = props;

  const dispatch = useDispatch();
  const user = useCurrentUser();
  const reactSettings = useReactSettings();
  const containerRef = useRef<HTMLDivElement>(null);

  const [cols, setCols] = useState(4);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setCols(columnsFromWidth(entry.contentRect.width));
    });

    observer.observe(el);
    setCols(columnsFromWidth(el.getBoundingClientRect().width));

    return () => observer.disconnect();
  }, []);

  const [cardOrder, setCardOrder] = useState<string[]>(() =>
    currentDashboardFields.map((f) => f.id)
  );

  useEffect(() => {
    const currentIds = currentDashboardFields.map((f) => f.id);
    const savedOrder: string[] =
      (reactSettings as any)?.preference_cards_order ?? [];

    if (savedOrder.length > 0) {
      const valid = savedOrder.filter((id) => currentIds.includes(id));
      const appended = currentIds.filter((id) => !valid.includes(id));
      const merged = [...valid, ...appended];

      if (merged.join() !== cardOrder.join()) {
        setCardOrder(merged);
      }
    } else {
      if (currentIds.join() !== cardOrder.join()) {
        setCardOrder(currentIds);
      }
    }
  }, [currentDashboardFields.length]);

  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (!isEditMode) return;
    dragId.current = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = dragId.current;
    if (!isEditMode || !sourceId || sourceId === dropId) {
      dragId.current = null;
      setDragOverId(null);
      return;
    }

    setCardOrder((prev) => {
      const next = [...prev];
      const from = next.indexOf(sourceId);
      const to = next.indexOf(dropId);
      if (from === -1 || to === -1) return prev;
      next.splice(from, 1);
      next.splice(to, 0, sourceId);
      return next;
    });

    dragId.current = null;
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    dragId.current = null;
    setDragOverId(null);
  };

  useDebounce(
    () => {
      if (!user) return;
      const saved = (reactSettings as any)?.preference_cards_order;
      if (JSON.stringify(saved) === JSON.stringify(cardOrder)) return;

      request('PUT', endpoint('/api/v1/company_users/:id', { id: user.id }), {
        react_settings: {
          ...reactSettings,
          preference_cards_order: cardOrder,
        },
      }).then((response: GenericSingleResourceResponse<CompanyUser>) => {
        dispatch(
          updateUser({
            ...user,
            company_user: response.data.data,
          })
        );
        $refetch(['company_users']);
      });
    },
    1500,
    [cardOrder]
  );

  const orderedFields = cardOrder
    .map((id) => currentDashboardFields.find((f) => f.id === id))
    .filter(Boolean) as DashboardField[];

  const cardWidthPercent = 100 / cols;

  return (
    <div ref={containerRef} className="w-full py-1">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {orderedFields.map((field) => {
          const isDragging = dragId.current === field.id;
          const isOver = dragOverId === field.id;

          return (
            <div
              key={field.id}
              draggable={isEditMode}
              onDragStart={(e) => handleDragStart(e, field.id)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, field.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => handleDrop(e, field.id)}
              onDragEnd={handleDragEnd}
              className={classNames('transition-transform duration-150', {
                'cursor-grab active:cursor-grabbing': isEditMode,
                'opacity-40': isDragging,
                'ring-2 ring-primary-400 ring-offset-2 rounded-lg scale-[1.03]':
                  isOver && isEditMode,
              })}
              style={{
                width: `calc(${cardWidthPercent}% - ${
                  ((cols - 1) / cols) * 1
                }rem)`,
                minWidth: '200px',
                flexShrink: 0,
                flexGrow: 0,
                height: '150px',
              }}
            >
              <DashboardCard
                field={field}
                dateRange={dateRange}
                startDate={startDate}
                endDate={endDate}
                currencyId={currencyId}
                layoutBreakpoint={layoutBreakpoint}
                fillHeight
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
