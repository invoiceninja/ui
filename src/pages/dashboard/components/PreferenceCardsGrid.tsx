/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { DashboardField } from '$app/common/interfaces/company-user';
import classNames from 'classnames';
import { DashboardCard } from './DashboardCard';
import { useDispatch } from 'react-redux';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { updateUser } from '$app/common/stores/slices/user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useDebounce } from 'react-use';

interface Props {
  currentDashboardFields: DashboardField[];
  dateRange: string;
  startDate: string;
  endDate: string;
  currencyId: string;
  layoutBreakpoint: string | undefined;
  isEditMode: boolean;
}

/**
 * PreferenceCardsGrid - Simple flexbox layout with drag and drop for preference cards
 */
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

  const [cardOrder, setCardOrder] = useState<string[]>(
    currentDashboardFields.map(field => field.id)
  );
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Update order when currentDashboardFields change
  useEffect(() => {
    const savedOrder = (reactSettings as any)?.preference_cards_order;
    const currentFieldIds = currentDashboardFields.map(field => field.id);
    
    if (savedOrder && Array.isArray(savedOrder)) {
      // Use saved order but filter to only include current fields
      const validOrder = savedOrder.filter((id: string) => 
        currentFieldIds.includes(id)
      );
      // Add any new fields not in saved order
      const newFields = currentFieldIds.filter(
        id => !validOrder.includes(id)
      );
      const newOrder = [...validOrder, ...newFields];
      
      // Only update if the order actually changed
      if (JSON.stringify(newOrder) !== JSON.stringify(cardOrder)) {
        setCardOrder(newOrder);
      }
    } else {
      // Only update if different from current
      if (JSON.stringify(currentFieldIds) !== JSON.stringify(cardOrder)) {
        setCardOrder(currentFieldIds);
      }
    }
  }, [currentDashboardFields.length]); // Only re-run when number of fields changes

  const handleUpdateUserPreferences = () => {
    if (!user) {
      return;
    }

    request('PUT', endpoint('/api/v1/company_users/:id', { id: user.id }), {
      react_settings: {
        ...reactSettings,
        preference_cards_order: cardOrder as any, // TypeScript type mismatch with ReactSettings
      },
    })
      .then((response: GenericSingleResourceResponse<CompanyUser>) => {
        dispatch(
          updateUser({
            ...user,
            company_user: response.data.data,
          })
        );
        $refetch(['users']);
      })
      .catch((error) => console.error(error));
  };

  // Save order changes with debounce
  useDebounce(
    () => {
      if (
        reactSettings &&
        JSON.stringify((reactSettings as any).preference_cards_order) !== JSON.stringify(cardOrder)
      ) {
        handleUpdateUserPreferences();
      }
    },
    1500,
    [cardOrder]
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, cardId: string) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    // Set dummy data to make drag work in Firefox
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, cardId: string) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setDragOverId(cardId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropCardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditMode || !draggedCardId) return;

    const draggedIndex = cardOrder.indexOf(draggedCardId);
    const dropIndex = cardOrder.indexOf(dropCardId);

    if (draggedIndex !== dropIndex) {
      const newOrder = [...cardOrder];
      // Remove dragged card
      newOrder.splice(draggedIndex, 1);
      // Insert at new position
      newOrder.splice(dropIndex, 0, draggedCardId);
      setCardOrder(newOrder);
    }

    setDraggedCardId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverId(null);
  };

  // Get ordered cards
  const orderedCards = cardOrder
    .map(id => currentDashboardFields.find(field => field.id === id))
    .filter(Boolean) as DashboardField[];

  return (
    <div 
      className="preference-cards-flexbox-grid"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.5rem',
      }}
    >
      {orderedCards.map((field) => (
        <div
          key={field.id}
          className={classNames('preference-card-drag-container', {
            'cursor-grab': isEditMode,
            'dragging': draggedCardId === field.id,
            'drag-over': dragOverId === field.id,
          })}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, field.id)}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, field.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, field.id)}
          onDragEnd={handleDragEnd}
          style={{
            width: 'calc(25% - 0.75rem)', // 4 cards per row with gap
            minWidth: '200px',
            height: '150px',
            opacity: draggedCardId === field.id ? 0.5 : 1,
            transform: dragOverId === field.id ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.2s ease',
            position: 'relative',
          }}
        >
            <DashboardCard
              field={field}
              dateRange={dateRange}
              startDate={startDate}
              endDate={endDate}
              currencyId={currencyId}
              layoutBreakpoint={layoutBreakpoint}
            />
        </div>
      ))}
    </div>
  );
}
