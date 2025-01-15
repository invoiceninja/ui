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
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import collect from 'collect.js';
import { useDebounce } from 'react-use';
import { diff } from 'deep-object-diff';
import { cloneDeep } from 'lodash';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { set } from 'lodash';
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
  setMainLayouts: Dispatch<SetStateAction<ReactGridLayout.Layouts>>;
  mainLayouts: ReactGridLayout.Layouts;
  isLayoutRestored: boolean;
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
    setMainLayouts,
    mainLayouts,
    isLayoutRestored,
  } = props;

  const dispatch = useDispatch();

  const user = useCurrentUser();
  const reactSettings = useReactSettings();

  const [layouts, setLayouts] = useState<ReactGridLayout.Layouts>({});
  const [isLayoutsInitialized, setIsLayoutsInitialized] =
    useState<boolean>(false);
  const [isLayoutHeightUpdated, setIsLayoutHeightUpdated] =
    useState<boolean>(false);

  const updateLayoutHeight = () => {
    if (!layoutBreakpoint) {
      return;
    }

    const totalCards = currentDashboardFields?.length || 0;
    let widthPerScreenSize = 0;

    switch (layoutBreakpoint) {
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

    setLayouts((prevLayouts) => {
      const currentLayoutForBreakpoint = prevLayouts[layoutBreakpoint] || [];

      const nonExistingCards = currentDashboardFields?.filter(
        (currentCard) =>
          !currentLayoutForBreakpoint.some((card) => currentCard.id === card.i)
      );

      if (!nonExistingCards.length) {
        return prevLayouts;
      }

      const cardsPerRow = Math.floor(1000 / (widthPerScreenSize + 20));
      const rows = Math.ceil(totalCards / cardsPerRow);
      const newCards = [];
      const cardsToAdd = [...nonExistingCards];

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cardsPerRow; j++) {
          const card = cardsToAdd.shift();

          if (card) {
            newCards.push({
              i: card.id,
              x: j * (widthPerScreenSize + 20),
              y: 0,
              w: widthPerScreenSize,
              h: 7.3,
            });
          }
        }
      }

      return cloneDeep({
        ...prevLayouts,
        [layoutBreakpoint]: [...currentLayoutForBreakpoint, ...newCards],
      });
    });

    setTimeout(() => {
      setIsLayoutHeightUpdated(true);
    }, 250);
  };

  const onDragStart = () => {
    if (!layoutBreakpoint) {
      return;
    }

    setMainLayouts((prevMainLayouts) => {
      const currentMainLayout = prevMainLayouts[layoutBreakpoint] || [];

      const preferenceCardBox = currentMainLayout.find(
        (card) => card.i === '1'
      );

      if (!preferenceCardBox) {
        return prevMainLayouts;
      }

      const uniqueYCoordinates = collect(layouts[layoutBreakpoint])
        .pluck('y')
        .unique()
        .toArray();

      const isMaximumRows =
        uniqueYCoordinates.length === layouts[layoutBreakpoint]?.length;

      return {
        ...prevMainLayouts,
        [layoutBreakpoint]: [
          ...(currentMainLayout?.filter((card) => card.i !== '1') || []),
          {
            ...preferenceCardBox,
            h:
              (currentMainLayout?.find((card) => card.i === '1')?.h || 0) +
              (isMaximumRows ? 0 : 9),
          },
        ],
      };
    });
  };

  const onDragStop = (currentLayout: ReactGridLayout.Layout[]) => {
    const gridElement = document.querySelector('.preference-cards-grid');

    if (!layoutBreakpoint || !gridElement?.clientHeight) {
      return;
    }

    setLayouts((prevLayouts) =>
      cloneDeep({
        ...prevLayouts,
        [layoutBreakpoint]: currentLayout,
      })
    );

    const preferenceCardBoxHeight = mainLayouts[layoutBreakpoint]?.find(
      (card) => card.i === '1'
    )?.h;

    if (
      preferenceCardBoxHeight &&
      preferenceCardBoxHeight === gridElement?.clientHeight / 21
    ) {
      return;
    }

    setMainLayouts((prevMainLayouts) => {
      const currentMainLayout = prevMainLayouts[layoutBreakpoint] || [];

      const preferenceCardBox = currentMainLayout.find(
        (card) => card.i === '1'
      );

      if (!preferenceCardBox) {
        return prevMainLayouts;
      }

      return {
        ...prevMainLayouts,
        [layoutBreakpoint]: [
          ...(currentMainLayout?.filter((card) => card.i !== '1') || []),
          {
            ...preferenceCardBox,
            h: gridElement?.clientHeight / 21 + (isEditMode ? 1 : 0),
          },
        ],
      };
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOnDrag = (
    layout: ReactGridLayout.Layout[],
    oldItem: ReactGridLayout.Layout,
    newItem: ReactGridLayout.Layout,
    placeholder: ReactGridLayout.Layout
  ) => {
    const isDraggingDown = newItem.y > placeholder.y;

    if (!isDraggingDown) return;

    const itemsBelow = layout.filter(
      (item) => item.y > oldItem.y && item.i !== oldItem.i
    );

    if (itemsBelow.length) {
      const closestItem = itemsBelow.reduce((closest, current) => {
        const isInSameColumn = Math.abs(current.x - oldItem.x) < 10;
        const isCloserVertically = current.y < closest.y;

        return isInSameColumn && isCloserVertically ? current : closest;
      }, itemsBelow[0]);

      const isDraggingTallerItem = oldItem.h > closestItem.h * 0.9;

      if (newItem.y > oldItem.h / 3 + oldItem.y && isDraggingTallerItem) {
        const oldX = oldItem.x;
        const oldY = oldItem.y;
        closestItem.x = oldX;
        closestItem.y = oldY;
      }
    }
  };

  const handleUpdateUserPreferences = () => {
    const updatedUser = cloneDeep(user) as User;

    set(
      updatedUser,
      'company_user.react_settings.preference_cards_configuration',
      cloneDeep(layouts)
    );

    request(
      'PUT',
      endpoint('/api/v1/company_users/:id', { id: updatedUser.id }),
      updatedUser
    ).then((response: GenericSingleResourceResponse<CompanyUser>) => {
      set(updatedUser, 'company_user', response.data.data);

      $refetch(['company_users']);

      dispatch(updateUser(updatedUser));
    });
  };

  useEffect(() => {
    if (layoutBreakpoint) {
      setTimeout(() => {
        updateLayoutHeight();
      }, 25);
    }
  }, [currentDashboardFields, layoutBreakpoint, isLayoutRestored]);

  useEffect(() => {
    if (isLayoutHeightUpdated) {
      setMainLayouts((prevMainLayouts) => {
        if (!layoutBreakpoint) {
          return prevMainLayouts;
        }

        const currentMainLayout = prevMainLayouts[layoutBreakpoint] || [];
        const gridElement = document.querySelector('.preference-cards-grid');

        if (!gridElement) {
          return prevMainLayouts;
        }

        const preferenceCardBox = currentMainLayout.find(
          (card) => card.i === '1'
        );

        if (!preferenceCardBox) {
          return prevMainLayouts;
        }

        return {
          ...prevMainLayouts,
          [layoutBreakpoint]: [
            ...(currentMainLayout?.filter((card) => card.i !== '1') || []),
            preferenceCardBox
              ? {
                  ...preferenceCardBox,
                  h: gridElement.clientHeight / 21 + (isEditMode ? 1 : 0),
                }
              : {
                  i: '1',
                  x: 0,
                  y: 1,
                  w: 1000,
                  h: gridElement.clientHeight / 21 + (isEditMode ? 1 : 0),
                  isResizable: false,
                },
          ],
        };
      });

      setIsLayoutHeightUpdated(false);
    }
  }, [isLayoutHeightUpdated]);

  useEffect(() => {
    setMainLayouts((prevMainLayouts) => {
      if (!layoutBreakpoint) {
        return prevMainLayouts;
      }

      const currentMainLayout = prevMainLayouts[layoutBreakpoint] || [];
      const gridElement = document.querySelector('.preference-cards-grid');

      if (!gridElement) {
        return prevMainLayouts;
      }

      const preferenceCardBox = currentMainLayout.find(
        (card) => card.i === '1'
      );

      if (!preferenceCardBox) {
        return prevMainLayouts;
      }

      return {
        ...prevMainLayouts,
        [layoutBreakpoint]: [
          ...(currentMainLayout?.filter((card) => card.i !== '1') || []),
          {
            ...preferenceCardBox,
            h: gridElement.clientHeight / 21 + (isEditMode ? 1 : 0),
          },
        ],
      };
    });
  }, [isEditMode]);

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
        updateLayoutHeight();
      }, 50);
    }
  }, [layoutBreakpoint, reactSettings]);

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
      draggableHandle=".preference-cards-grid-drag-handle"
      margin={[0, 20]}
      rowHeight={1}
      isDraggable={isEditMode}
      isDroppable={isEditMode}
      isResizable={false}
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      //onDrag={handleOnDrag}
    >
      {currentDashboardFields.map((field) => (
        <div
          key={field.id}
          className={classNames('preference-cards-grid-drag-handle', {
            'cursor-grab': isEditMode,
          })}
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
