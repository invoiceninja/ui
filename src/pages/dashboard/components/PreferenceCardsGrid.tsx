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
  DashboardField,
} from '$app/common/interfaces/company-user';
import { DashboardCard } from './DashboardCard';
import ReactGridLayout from 'react-grid-layout';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

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
 * PreferenceCardsGrid - Fixed-height grid using CSS Grid
 *
 * Heights are controlled ONLY by manual resize in parent ResponsiveGridLayout.
 * No automatic height calculation to prevent conflicts.
 */
export function PreferenceCardsGrid(props: Props) {
  const {
    currentDashboardFields,
    dateRange,
    startDate,
    endDate,
    currencyId,
    layoutBreakpoint,
  } = props;

  // Determine grid columns based on breakpoint
  const getGridColumns = () => {
    switch (layoutBreakpoint) {
      case 'xxl':
      case 'xl':
        return 'repeat(auto-fill, minmax(180px, 1fr))';
      case 'lg':
      case 'md':
        return 'repeat(auto-fill, minmax(220px, 1fr))';
      case 'sm':
      case 'xs':
        return 'repeat(auto-fill, minmax(280px, 1fr))';
      case 'xxs':
        return 'repeat(auto-fill, minmax(350px, 1fr))';
      default:
        return 'repeat(auto-fill, minmax(220px, 1fr))';
    }
  };

  return (
   <div
     className="preference-cards-container"
     style={{
       display: 'grid',
       gridTemplateColumns: getGridColumns(),
       gap: '20px',
       padding: '16px',
       width: '100%',
       height: '100%',
       overflow: 'auto',
       pointerEvents: 'auto',
     }}
   >
      {currentDashboardFields.map((field) => (
        <DashboardCard
          key={field.id}
          field={field}
          dateRange={dateRange}
          startDate={startDate}
          endDate={endDate}
          currencyId={currencyId}
          layoutBreakpoint={layoutBreakpoint}
        />
      ))}
    </div>
  );
}
