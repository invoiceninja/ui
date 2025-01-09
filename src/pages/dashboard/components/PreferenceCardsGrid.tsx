/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DashboardField } from '$app/common/interfaces/company-user';
import classNames from 'classnames';
import { DashboardCard } from './DashboardCard';
import ReactGridLayout, { Responsive } from 'react-grid-layout';
import { WidthProvider } from 'react-grid-layout';
import { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

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

  const reactSettings = useReactSettings();

  const [layouts, setLayouts] = useState<ReactGridLayout.Layouts>({});
  const [isLayoutsInitialized, setIsLayoutsInitialized] =
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
        break;
    }

    const nonExistingCards = currentDashboardFields?.filter(
      (currentCard) =>
        !layouts[layoutBreakpoint]?.some((card) => currentCard.id === card.i)
    );

    setLayouts((currentLayouts) => {
      const updatedLayouts = cloneDeep(currentLayouts || {});
      const cardsPerRow = Math.floor(1000 / (widthPerScreenSize + 10));
      const rows = Math.ceil(totalCards / cardsPerRow);
      const newCards = [];

      if (nonExistingCards.length) {
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cardsPerRow; j++) {
            const card = nonExistingCards.shift();

            if (card) {
              newCards.push({
                i: card.id,
                x: j * (widthPerScreenSize + 10),
                y: 0,
                w: widthPerScreenSize,
                h: 7.3,
              });
            }
          }
        }
      }

      return {
        ...updatedLayouts,
        [layoutBreakpoint]: [
          ...(updatedLayouts[layoutBreakpoint] || []),
          ...newCards,
        ],
      };
    });
  };

  useEffect(() => {
    updateLayoutHeight();
  }, [currentDashboardFields, layoutBreakpoint]);

  useEffect(() => {
    if (layoutBreakpoint) {
      if (
        reactSettings?.dashboard_cards_configuration &&
        !isLayoutsInitialized
      ) {
        setLayouts(cloneDeep(reactSettings?.dashboard_cards_configuration));

        setIsLayoutsInitialized(true);
      }

      setTimeout(() => {
        updateLayoutHeight();
      }, 75);
    }
  }, [layoutBreakpoint]);

  return (
    <ResponsiveGridLayout
      className="layout responsive-grid-box"
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
      draggableHandle=".drag-handle"
      margin={[0, 0]}
      rowHeight={1}
      isDraggable={true}
      isDroppable={true}
      isResizable={false}
      //onDragStop={onDragStop}
      draggableCancel=".cancelDraggingCards"
      //onDrag={handleOnDrag}
    >
      {currentDashboardFields.map((field) => (
        <div
          key={field.id}
          className={classNames('drag-handle', {
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
