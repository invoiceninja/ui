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
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import collect from 'collect.js';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DemoCard = ({ number }: { number: number }) => (
  <div className="bg-white p-4 rounded shadow h-full">
    <h3 className="text-lg font-semibold">Box {number}</h3>
    <p>Demo content for box {number}</p>
  </div>
);

export const demoLayout = {
  xxl: [
    // Header box
    {
      i: 'box1',
      x: 0,
      y: 0,
      w: 1000,
      h: 4,
      isResizable: false,
    },
    // First row - 3 boxes
    {
      i: 'box2',
      x: 0,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box3',
      x: 340,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box4',
      x: 670,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Second row - 3 boxes
    {
      i: 'box5',
      x: 0,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box6',
      x: 340,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box7',
      x: 670,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Third row - 3 boxes
    {
      i: 'box8',
      x: 0,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box9',
      x: 340,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box10',
      x: 670,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fourth row - 3 boxes
    {
      i: 'box11',
      x: 0,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box12',
      x: 340,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box13',
      x: 670,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fifth row - 3 boxes
    {
      i: 'box14',
      x: 0,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box15',
      x: 340,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box16',
      x: 670,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
  ],
  // Ponovite isti raspored za xl, lg, md, sm, xs i xxs breakpoints
  xl: [
    // Header box
    {
      i: 'box1',
      x: 0,
      y: 0,
      w: 1000,
      h: 4,
      isResizable: false,
    },
    // First row - 3 boxes
    {
      i: 'box2',
      x: 0,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box3',
      x: 340,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box4',
      x: 670,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Second row - 3 boxes
    {
      i: 'box5',
      x: 0,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box6',
      x: 340,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box7',
      x: 670,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Third row - 3 boxes
    {
      i: 'box8',
      x: 0,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box9',
      x: 340,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box10',
      x: 670,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fourth row - 3 boxes
    {
      i: 'box11',
      x: 0,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box12',
      x: 340,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box13',
      x: 670,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fifth row - 3 boxes
    {
      i: 'box14',
      x: 0,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box15',
      x: 340,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box16',
      x: 670,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
  ],
  lg: [
    // Header box
    {
      i: 'box1',
      x: 0,
      y: 0,
      w: 1000,
      h: 4,
      isResizable: false,
    },
    // First row - 3 boxes
    {
      i: 'box2',
      x: 0,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box3',
      x: 340,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box4',
      x: 670,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Second row - 3 boxes
    {
      i: 'box5',
      x: 0,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box6',
      x: 340,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box7',
      x: 670,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Third row - 3 boxes
    {
      i: 'box8',
      x: 0,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box9',
      x: 340,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box10',
      x: 670,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fourth row - 3 boxes
    {
      i: 'box11',
      x: 0,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box12',
      x: 340,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box13',
      x: 670,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fifth row - 3 boxes
    {
      i: 'box14',
      x: 0,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box15',
      x: 340,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box16',
      x: 670,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
  ],
  md: [
    // Header box
    {
      i: 'box1',
      x: 0,
      y: 0,
      w: 1000,
      h: 4,
      isResizable: false,
    },
    // First row - 3 boxes
    {
      i: 'box2',
      x: 0,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box3',
      x: 340,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box4',
      x: 670,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Second row - 3 boxes
    {
      i: 'box5',
      x: 0,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box6',
      x: 340,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box7',
      x: 670,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Third row - 3 boxes
    {
      i: 'box8',
      x: 0,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box9',
      x: 340,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box10',
      x: 670,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fourth row - 3 boxes
    {
      i: 'box11',
      x: 0,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box12',
      x: 340,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box13',
      x: 670,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fifth row - 3 boxes
    {
      i: 'box14',
      x: 0,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box15',
      x: 340,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box16',
      x: 670,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
  ],
  sm: [
    // Header box
    {
      i: 'box1',
      x: 0,
      y: 0,
      w: 1000,
      h: 4,
      isResizable: false,
    },
    // First row - 3 boxes
    {
      i: 'box2',
      x: 0,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box3',
      x: 340,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box4',
      x: 670,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Second row - 3 boxes
    {
      i: 'box5',
      x: 0,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box6',
      x: 340,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box7',
      x: 670,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Third row - 3 boxes
    {
      i: 'box8',
      x: 0,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box9',
      x: 340,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box10',
      x: 670,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fourth row - 3 boxes
    {
      i: 'box11',
      x: 0,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box12',
      x: 340,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box13',
      x: 670,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fifth row - 3 boxes
    {
      i: 'box14',
      x: 0,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box15',
      x: 340,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box16',
      x: 670,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
  ],
  xs: [
    // Header box
    {
      i: 'box1',
      x: 0,
      y: 0,
      w: 1000,
      h: 4,
      isResizable: false,
    },
    // First row - 3 boxes
    {
      i: 'box2',
      x: 0,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box3',
      x: 340,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box4',
      x: 670,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Second row - 3 boxes
    {
      i: 'box5',
      x: 0,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box6',
      x: 340,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box7',
      x: 670,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Third row - 3 boxes
    {
      i: 'box8',
      x: 0,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box9',
      x: 340,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box10',
      x: 670,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fourth row - 3 boxes
    {
      i: 'box11',
      x: 0,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box12',
      x: 340,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box13',
      x: 670,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fifth row - 3 boxes
    {
      i: 'box14',
      x: 0,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box15',
      x: 340,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box16',
      x: 670,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
  ],
  xxs: [
    // Header box
    {
      i: 'box1',
      x: 0,
      y: 0,
      w: 1000,
      h: 4,
      isResizable: false,
    },
    // First row - 3 boxes
    {
      i: 'box2',
      x: 0,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box3',
      x: 340,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box4',
      x: 670,
      y: 1,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Second row - 3 boxes
    {
      i: 'box5',
      x: 0,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box6',
      x: 340,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box7',
      x: 670,
      y: 2,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Third row - 3 boxes
    {
      i: 'box8',
      x: 0,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box9',
      x: 340,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box10',
      x: 670,
      y: 3,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fourth row - 3 boxes
    {
      i: 'box11',
      x: 0,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box12',
      x: 340,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box13',
      x: 670,
      y: 4,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    // Fifth row - 3 boxes
    {
      i: 'box14',
      x: 0,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box15',
      x: 340,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
    {
      i: 'box16',
      x: 670,
      y: 5,
      w: 330,
      h: 20,
      minH: 15,
      minW: 250,
    },
  ],
};

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
              w: widthPerScreenSize + 20,
              h: 15,
            });
          }
        }
      }

      return {
        ...prevLayouts,
        [layoutBreakpoint]: [...currentLayoutForBreakpoint, ...newCards],
      };
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

    setLayouts((prevLayouts) => {
      return {
        ...prevLayouts,
        [layoutBreakpoint]: currentLayout,
      };
    });

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

  const handleOnDrag = (
    layout: ReactGridLayout.Layout[],
    oldItem: ReactGridLayout.Layout,
    newItem: ReactGridLayout.Layout,
    placeholder: ReactGridLayout.Layout
  ) => {
    const isDraggingDown = newItem.y > placeholder.y;

    console.log(isDraggingDown);

    //handleScroll(isDraggingDown);

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

      if (newItem.y > oldItem.h / 1.2 + oldItem.y && isDraggingTallerItem) {
        const oldX = oldItem.x;
        const oldY = oldItem.y;
        closestItem.x = oldX;
        closestItem.y = oldY;
      }
    }
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
        reactSettings?.dashboard_cards_configuration &&
        !isLayoutsInitialized
      ) {
        //setLayouts(cloneDeep(reactSettings?.dashboard_cards_configuration));

        setIsLayoutsInitialized(true);
      }

      setTimeout(() => {
        updateLayoutHeight();
      }, 50);
    }
  }, [layoutBreakpoint]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const demoFields = [
    { id: 'box1', number: 1 },
    { id: 'box2', number: 2 },
    { id: 'box3', number: 3 },
    { id: 'box4', number: 4 },
    { id: 'box5', number: 5 },
    { id: 'box6', number: 6 },
    { id: 'box7', number: 7 },
    { id: 'box8', number: 8 },
    { id: 'box9', number: 9 },
    { id: 'box10', number: 10 },
    { id: 'box11', number: 11 },
    { id: 'box12', number: 12 },
    { id: 'box13', number: 13 },
    { id: 'box14', number: 14 },
    { id: 'box15', number: 15 },
    { id: 'box16', number: 16 },
  ];

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
      layouts={demoLayout}
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
      isDraggable={true}
      isDroppable={true}
      isResizable={false}
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      onDrag={handleOnDrag}
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
