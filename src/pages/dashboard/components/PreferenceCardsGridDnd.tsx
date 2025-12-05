/**
 * First-row PreferenceCardsGrid (dnd-kit version)
 *
 * Drag-only, no resize. Keeps persisted layout shape, writes back on drop.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useDispatch } from 'react-redux';
import { updateUser } from '$app/common/stores/slices/user';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CompanyUser, DashboardField } from '$app/common/interfaces/company-user';
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

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: '100%',
    cursor: isDragging ? 'grabbing' as const : 'grab' as const,
    opacity: isDragging ? 0.85 : 1,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="sortable-card"
      data-id={id}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

export function PreferenceCardsGridDnd(props: Props) {
  const {
    currentDashboardFields,
    dateRange,
    startDate,
    endDate,
    currencyId,
    layoutBreakpoint,
    isEditMode,
  } = props;

  const user = useCurrentUser();
  const reactSettings = useReactSettings();
  const dispatch = useDispatch();

  // Maintain a flat array of ids for ordering within the first row
  const [order, setOrder] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overlaySize, setOverlaySize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    // Initialize from saved settings if present; else from fields
    const saved = reactSettings?.preference_cards_configuration;
    const ids = currentDashboardFields.map((f) => f.id);
    if (saved && typeof saved === 'object') {
      // Fallback to ids order by field list when unknown
      setOrder(ids);
    } else {
      setOrder(ids);
    }
  }, [currentDashboardFields.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 4,
      },
    })
  );

  const items = useMemo(() => order.filter((id) => currentDashboardFields.some((f) => f.id === id)), [order, currentDashboardFields.length]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active?.id ?? null);
    // Measure the active element to size the overlay and prevent jump
    try {
      const el = document.querySelector(
        `.preference-cards-grid .sortable-card[data-id="${event.active?.id}"]`
      ) as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        setOverlaySize({ width: rect.width, height: rect.height });
      } else {
        setOverlaySize(null);
      }
    } catch {
      setOverlaySize(null);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    setOverlaySize(null);
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setOrder(next);

    // Persist order to user settings under preference_cards_configuration
    if (user) {
      request('PUT', endpoint('/api/v1/company_users/:id', { id: user.id }), {
        react_settings: {
          ...reactSettings,
          preference_cards_configuration: { order: next },
        },
      })
        .then((response: GenericSingleResourceResponse<CompanyUser>) => {
          dispatch(updateUser({ ...user, company_user: response.data.data }));
        })
        .catch(() => {});
    }
  };

  return (
    <div
      className="preference-cards-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 20,
        alignItems: 'start',
        justifyItems: 'stretch',
        gridAutoFlow: 'row',
        alignContent: 'start',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {items.map((id) => {
            const field = currentDashboardFields.find((f) => f.id === id);
            if (!field) return null;
            return (
              <SortableItem key={id} id={id}>
                <div
                  className={isEditMode ? 'cursor-grab' : ''}
                  style={{ width: '100%' }}
                  onMouseDown={() => setSelectedId(id)}
                >
                  <DashboardCard
                    field={field}
                    dateRange={dateRange}
                    startDate={startDate}
                    endDate={endDate}
                    currencyId={currencyId}
                    layoutBreakpoint={layoutBreakpoint}
                    fillHeight={false}
                  />
                </div>
              </SortableItem>
            );
          })}
        </SortableContext>
        <DragOverlay adjustScale style={{ cursor: 'grabbing' }}>
          {activeId ? (
            (() => {
              const field = currentDashboardFields.find((f) => f.id === activeId);
              if (!field) return null;
              return (
                <div
                  className="sortable-card overlay"
                  style={{ width: overlaySize?.width ?? 240, height: overlaySize?.height }}
                >
                  <DashboardCard
                    field={field}
                    dateRange={dateRange}
                    startDate={startDate}
                    endDate={endDate}
                    currencyId={currencyId}
                    layoutBreakpoint={layoutBreakpoint}
                    fillHeight={false}
                  />
                </div>
              );
            })()
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
