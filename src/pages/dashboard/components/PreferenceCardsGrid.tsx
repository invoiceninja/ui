import classNames from 'classnames';
import { useRef, useState } from 'react';
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
  currentDashboardFields: DashboardCardField[];
  dateRange: string;
  startDate: string;
  endDate: string;
  currencyId: string;
  layoutBreakpoint: string;
  isEditMode: boolean;
}

export function PreferenceCardsGrid({
  currentDashboardFields,
  dateRange,
  startDate,
  endDate,
  currencyId,
  isEditMode,
}: Props) {
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const reactSettings = useReactSettings();

  const [order, setOrder] = useState<string[]>(() => {
    const ids = currentDashboardFields.map((f) => f.id);
    const saved = reactSettings.preference_cards_order ?? [];
    const valid = saved.filter((id) => ids.includes(id));
    const appended = ids.filter((id) => !valid.includes(id));
    return [...valid, ...appended];
  });

  useDebounce(
    () => {
      if (!user) return;
      if (
        JSON.stringify(reactSettings.preference_cards_order) ===
        JSON.stringify(order)
      )
        return;

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
    if (!isEditMode) return;
    dragId.current = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

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

  const fieldMap = Object.fromEntries(
    currentDashboardFields.map((f) => [f.id, f])
  );
  const ordered = order
    .map((id) => fieldMap[id])
    .filter((f): f is DashboardCardField => Boolean(f));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '1rem',
        width: '100%',
      }}
    >
      {ordered.map((field, index) => (
        <div
          key={field.id}
          draggable={isEditMode}
          onDragStart={(e) => onDragStart(e, field.id)}
          onDragOver={onDragOver}
          onDragEnter={() => setOverIndex(index)}
          onDragLeave={() => setOverIndex(null)}
          onDrop={(e) => onDrop(e, index)}
          onDragEnd={onDragEnd}
          style={{ height: '130px' }}
          className={classNames('transition-all duration-150', {
            'cursor-grab active:cursor-grabbing': isEditMode,
            'opacity-40': dragId.current === field.id,
            'ring-2 ring-blue-400 ring-offset-2 rounded-lg':
              overIndex === index && dragId.current !== field.id,
          })}
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
  );
}
