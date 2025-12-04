/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  CompanyUser,
  DashboardField,
} from '$app/common/interfaces/company-user';
import classNames from 'classnames';
import { DashboardCard } from './DashboardCard';
import ReactGridLayout, { Responsive } from 'react-grid-layout';
import { WidthProvider } from 'react-grid-layout';
import { useEffect, useState } from 'react';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useDebounce } from 'react-use';
import { diff } from 'deep-object-diff';
import { cloneDeep } from 'lodash';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { $refetch } from '$app/common/hooks/useRefetch';
import { updateUser } from '$app/common/stores/slices/user';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { User } from '$app/common/interfaces/user';
import { useDispatch } from 'react-redux';

const ResponsiveGridLayout = WidthProvider(Responsive);

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
 * PreferenceCardsGrid - Nested ResponsiveGridLayout for individual card drag/drop
 * 
 * NO HEIGHT MANIPULATION - Heights controlled by parent ResponsiveGridLayout only
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

  const [layouts, setLayouts] = useState<ReactGridLayout.Layouts>({});
  const [isLayoutsInitialized, setIsLayoutsInitialized] = useState<boolean>(false);
  const [dragStartLayout, setDragStartLayout] = useState<ReactGridLayout.Layout[]>([]);

  // Generate initial layout for cards
  const generateLayoutForCards = (
    cards: DashboardField[],
    breakpoint: string
  ) => {
    const totalCards = cards?.length || 0;
    let widthPerScreenSize = 0;

    switch (breakpoint) {
      case 'xxl':
        widthPerScreenSize = 150;
        break;
      case 'xl':
        widthPerScreenSize = 200;
        break;
      case 'lg':
        widthPerScreenSize = 250;
        break;
      case 'md':
        widthPerScreenSize = 300;
        break;
      case 'sm':
        widthPerScreenSize = 350;
        break;
      case 'xs':
        widthPerScreenSize = 500;
        break;
      case 'xxs':
        widthPerScreenSize = 1000;
        break;
      default:
        widthPerScreenSize = 200;
    }

    const cardsPerRow = Math.floor(1000 / (widthPerScreenSize + 20));
    const rows = Math.ceil(totalCards / cardsPerRow);
    const newCards = [];
    const cardsToAdd = [...cards];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cardsPerRow; j++) {
        const card = cardsToAdd.shift();

        if (!card) {
          break;
        }

        newCards.push({
          i: card.id,
          x: j * (widthPerScreenSize + 20),
          y: i * (140 + 20),
          w: widthPerScreenSize,
          h: 140,
        });
      }
    }

    return newCards;
  };

  // Update layout when cards or breakpoint change
  const updateLayoutForNewCards = () => {
    if (!layoutBreakpoint) {
      return;
    }

    setLayouts((currentLayouts) => {
      const currentLayoutForBreakpoint =
        currentLayouts[layoutBreakpoint] || [];
      const newCardsLayout = generateLayoutForCards(
        currentDashboardFields,
        layoutBreakpoint
      );

      return {
        ...currentLayouts,
        [layoutBreakpoint]: [
          ...currentLayoutForBreakpoint.filter((existingCard) =>
            currentDashboardFields.some(
              (newCard) => newCard.id === existingCard.i
            )
          ),
          ...newCardsLayout.filter(
            (newCard) =>
              !currentLayoutForBreakpoint.some(
                (existingCard) => existingCard.i === newCard.i
              )
          ),
        ],
      };
    });
  };

  // Save layout to backend
 const handleUpdateUserPreferences = () => {
    if (!user) return;
    
    request('PUT', endpoint('/api/v1/company_users/:id', { id: user.id }), {
     react_settings: {
       ...reactSettings,
        preference_cards_configuration: cloneDeep(layouts),
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
      .catch((error) => {
        console.error(error);
      });
  };

  // Initialize layouts from saved settings
  useEffect(() => {
    if (layoutBreakpoint) {
      if (
        reactSettings?.preference_cards_configuration &&
        !isLayoutsInitialized
      ) {
        setLayouts(cloneDeep(reactSettings?.preference_cards_configuration));
        setIsLayoutsInitialized(true);
      }

      setTimeout(() => {
        updateLayoutForNewCards();
      }, 50);
    }
  }, [layoutBreakpoint, currentDashboardFields.length]);

  // Save layout changes with debounce
  useDebounce(
    () => {
      if (
        reactSettings &&
        ((reactSettings.preference_cards_configuration &&
          Object.keys(
            diff(reactSettings.preference_cards_configuration, layouts)
          ).length) ||
          !reactSettings.preference_cards_configuration)
      ) {
        handleUpdateUserPreferences();
      }
    },
    1500,
    [layouts]
  );

  // Custom drag handler to implement smoother drag behavior
  const handleDrag = (layout: ReactGridLayout.Layout[], oldItem: ReactGridLayout.Layout, newItem: ReactGridLayout.Layout) => {
    // Don't apply threshold logic, just let cards move freely
    // The overlap mode allows cards to temporarily overlap during drag
    // They will snap to grid on drop
  };

  // Track drag start position
  const handleDragStart = (layout: ReactGridLayout.Layout[], oldItem: ReactGridLayout.Layout, newItem: ReactGridLayout.Layout) => {
    setDragStartLayout(cloneDeep(layout));
  };

  // Apply collision detection on drag stop
  const handleDragStop = (layout: ReactGridLayout.Layout[], oldItem: ReactGridLayout.Layout, newItem: ReactGridLayout.Layout) => {
    // Allow the layout to settle naturally
    // Grid will prevent final overlaps automatically
  };

  return (
    <ResponsiveGridLayout
      className="preference-cards-grid"
      breakpoints={{
        xxl: 1400,
        xl: 1200,
        lg: 1000,
        md: 800,
        sm: 600,
        xs: 300,
        xxs: 0,
      }}
      layouts={layouts}
      cols={{
        xxl: 1000,
        xl: 1000,
        lg: 1000,
        md: 1000,
        sm: 1000,
        xs: 1000,
        xxs: 1000,
      }}
      draggableHandle=".preference-card-drag-handle"
      margin={[0, 20]}
      rowHeight={1}
      isDraggable={isEditMode}
      isDroppable={true}
      isResizable={false}
      onLayoutChange={(layout, layouts) => setLayouts(layouts)}
      compactType="vertical"
      preventCollision={true}
      allowOverlap={false}
      verticalCompact={true}
      maxRows={20}
      containerPadding={[0, 0]}
      useCSSTransforms={true}
      onDrag={handleDrag}
      onDragStart={handleDragStart}
      onDragStop={handleDragStop}
      transformScale={1}
    >
      {currentDashboardFields.map((field) => (
        <div
          key={field.id}
          className={classNames('preference-card-drag-handle', {
            'cursor-grab': isEditMode,
          })}
          style={{
            height: '100%',
            pointerEvents: 'auto',
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
    </ResponsiveGridLayout>
  );
}
