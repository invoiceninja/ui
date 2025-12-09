/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useQuery } from 'react-query';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Spinner } from '$app/components/Spinner';
import { Activity } from './Activity';
import { RecentPayments } from './RecentPayments';
import { UpcomingInvoices } from './UpcomingInvoices';
import { PastDueInvoices } from './PastDueInvoices';
import { ExpiredQuotes } from './ExpiredQuotes';
import { UpcomingQuotes } from './UpcomingQuotes';
import { UpcomingRecurringInvoices } from './UpcomingRecurringInvoices';
import { Chart } from './Chart';
import './dashboard-smooth.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define available card IDs
const AVAILABLE_CARDS = [
  'totals',
  'chart',
  'activity',
  'recent_payments',
  'upcoming_invoices',
  'past_due_invoices',
  'expired_quotes',
  'upcoming_quotes',
  'upcoming_recurring_invoices'
];

// Default layouts for different screen sizes
const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'totals', x: 0, y: 0, w: 12, h: 4, minW: 4, minH: 3 },
    { i: 'chart', x: 0, y: 4, w: 12, h: 6, minW: 4, minH: 4 },
    { i: 'activity', x: 0, y: 10, w: 6, h: 5, minW: 3, minH: 3 },
    { i: 'recent_payments', x: 6, y: 10, w: 6, h: 5, minW: 3, minH: 3 },
    { i: 'upcoming_invoices', x: 0, y: 15, w: 4, h: 5, minW: 2, minH: 3 },
    { i: 'past_due_invoices', x: 4, y: 15, w: 4, h: 5, minW: 2, minH: 3 },
    { i: 'expired_quotes', x: 8, y: 15, w: 4, h: 5, minW: 2, minH: 3 },
    { i: 'upcoming_quotes', x: 0, y: 20, w: 6, h: 5, minW: 3, minH: 3 },
    { i: 'upcoming_recurring_invoices', x: 6, y: 20, w: 6, h: 5, minW: 3, minH: 3 },
  ],
  md: [
    { i: 'totals', x: 0, y: 0, w: 10, h: 4, minW: 4, minH: 3 },
    { i: 'chart', x: 0, y: 4, w: 10, h: 6, minW: 4, minH: 4 },
    { i: 'activity', x: 0, y: 10, w: 5, h: 5, minW: 3, minH: 3 },
    { i: 'recent_payments', x: 5, y: 10, w: 5, h: 5, minW: 3, minH: 3 },
    { i: 'upcoming_invoices', x: 0, y: 15, w: 5, h: 5, minW: 2, minH: 3 },
    { i: 'past_due_invoices', x: 5, y: 15, w: 5, h: 5, minW: 2, minH: 3 },
    { i: 'expired_quotes', x: 0, y: 20, w: 5, h: 5, minW: 2, minH: 3 },
    { i: 'upcoming_quotes', x: 5, y: 20, w: 5, h: 5, minW: 3, minH: 3 },
    { i: 'upcoming_recurring_invoices', x: 0, y: 25, w: 10, h: 5, minW: 3, minH: 3 },
  ],
  sm: [
    { i: 'totals', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    { i: 'chart', x: 0, y: 4, w: 6, h: 6, minW: 3, minH: 4 },
    { i: 'activity', x: 0, y: 10, w: 6, h: 5, minW: 3, minH: 3 },
    { i: 'recent_payments', x: 0, y: 15, w: 6, h: 5, minW: 3, minH: 3 },
    { i: 'upcoming_invoices', x: 0, y: 20, w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'past_due_invoices', x: 3, y: 20, w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'expired_quotes', x: 0, y: 25, w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'upcoming_quotes', x: 3, y: 25, w: 3, h: 5, minW: 2, minH: 3 },
    { i: 'upcoming_recurring_invoices', x: 0, y: 30, w: 6, h: 5, minW: 3, minH: 3 },
  ],
  xs: [
    { i: 'totals', x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 3 },
    { i: 'chart', x: 0, y: 4, w: 4, h: 6, minW: 2, minH: 4 },
    { i: 'activity', x: 0, y: 10, w: 4, h: 5, minW: 2, minH: 3 },
    { i: 'recent_payments', x: 0, y: 15, w: 4, h: 5, minW: 2, minH: 3 },
    { i: 'upcoming_invoices', x: 0, y: 20, w: 4, h: 5, minW: 2, minH: 3 },
    { i: 'past_due_invoices', x: 0, y: 25, w: 4, h: 5, minW: 2, minH: 3 },
    { i: 'expired_quotes', x: 0, y: 30, w: 4, h: 5, minW: 2, minH: 3 },
    { i: 'upcoming_quotes', x: 0, y: 35, w: 4, h: 5, minW: 2, minH: 3 },
    { i: 'upcoming_recurring_invoices', x: 0, y: 40, w: 4, h: 5, minW: 2, minH: 3 },
  ],
  xxs: [
    { i: 'totals', x: 0, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: 'chart', x: 0, y: 4, w: 2, h: 6, minW: 2, minH: 4 },
    { i: 'activity', x: 0, y: 10, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'recent_payments', x: 0, y: 15, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'upcoming_invoices', x: 0, y: 20, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'past_due_invoices', x: 0, y: 25, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'expired_quotes', x: 0, y: 30, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'upcoming_quotes', x: 0, y: 35, w: 2, h: 5, minW: 2, minH: 3 },
    { i: 'upcoming_recurring_invoices', x: 0, y: 40, w: 2, h: 5, minW: 2, minH: 3 },
  ],
};

export function GrafanaWorkingDashboard() {
  const { dateFormat } = useCurrentCompanyDateFormats();
  const reactSettings = useReactSettings();
  
  // Debug state
  console.log('GrafanaWorkingDashboard - Rendering');
  
  // Load saved layouts or use defaults
  const [layouts, setLayouts] = useState(() => {
    const saved = localStorage.getItem('dashboardLayouts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_LAYOUTS;
      }
    }
    return DEFAULT_LAYOUTS;
  });

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [visibleCards, setVisibleCards] = useState(AVAILABLE_CARDS);
  
  console.log('Edit mode:', isEditMode);

  // Update layouts to add/remove static property based on edit mode
 useEffect(() => {
   setLayouts((prevLayouts: any) => {
     const updatedLayouts: any = {};
     Object.keys(prevLayouts).forEach(breakpoint => {
       updatedLayouts[breakpoint] = prevLayouts[breakpoint].map((item: any) => ({
         ...item,
         static: !isEditMode // Cards are static when NOT in edit mode
       }));
     });
     return updatedLayouts;
   });
  }, [isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch dashboard data
  const { data: dashboardData } = useQuery(
    ['dashboard'],
    () => request('GET', endpoint('/api/v1/dashboard')),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch chart data
  const { data: chartData } = useQuery(
    ['chart_summary'],
    () => request('GET', endpoint('/api/v1/charts/chart_summary')),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  // Handle layout changes
  const handleLayoutChange = (layout: any, allLayouts: any) => {
    console.log('Layout changing:', { layout, allLayouts });
    setLayouts(allLayouts);
    // Save to localStorage
    localStorage.setItem('dashboardLayouts', JSON.stringify(allLayouts));
    console.log('Layout saved:', allLayouts);
  };

  // Reset layouts to default
  const handleResetLayouts = () => {
    setLayouts(DEFAULT_LAYOUTS);
    localStorage.removeItem('dashboardLayouts');
    setIsEditMode(false);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    console.log('Toggling edit mode from', isEditMode, 'to', !isEditMode);
    setIsEditMode(prev => !prev);
  };

  // Render individual cards
 const renderCard = (cardId: string) => {
    const formatMoney = useFormatMoney();
    const company = useCurrentCompany();
    
   const cardContent = () => {
     switch (cardId) {
       case 'totals':
          if (!dashboardData?.data) {
            return (
              <div className="flex items-center justify-center h-full">
                <Spinner />
              </div>
            );
          }
          const totals = dashboardData.data;
          return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatMoney(parseFloat(totals.revenue?.paid_to_date || '0'), totals.revenue?.code, company?.settings?.country_id)}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Expenses</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatMoney(parseFloat(totals.expenses?.amount || '0'), totals.expenses?.code, company?.settings?.country_id)}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Invoiced</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatMoney(parseFloat(totals.invoices?.invoiced_amount || '0'), totals.invoices?.code, company?.settings?.country_id)}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Outstanding</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatMoney(parseFloat(totals.outstanding?.amount || '0'), totals.outstanding?.code, company?.settings?.country_id)}
                </div>
                <div className="text-xs text-gray-500">
                  {totals.outstanding?.outstanding_count || 0} invoices
                </div>
              </div>
            </div>
          );

       case 'chart':
         return chartData?.data ? (
           <Chart
             data={chartData.data as any}
              dates={{ start_date: '', end_date: '' }}
              currency={company?.settings?.currency_id || 'USD'}
              chartSensitivity="day"
           />
         ) : (
            <div>Loading chart...</div>
          );

        case 'activity':
          return <Activity isEditMode={isEditMode} />;  

       case 'recent_payments':
          return <RecentPayments isEditMode={isEditMode} />;

       case 'upcoming_invoices':
          return <UpcomingInvoices isEditMode={isEditMode} />;

       case 'past_due_invoices':
          return <PastDueInvoices isEditMode={isEditMode} />;

        case 'expired_quotes':
          return <ExpiredQuotes isEditMode={isEditMode} />;

       case 'upcoming_quotes':
          return <UpcomingQuotes isEditMode={isEditMode} />;

       case 'upcoming_recurring_invoices':
          return <UpcomingRecurringInvoices isEditMode={isEditMode} />;

        default:
          return <div>Unknown card: {cardId}</div>;
      }
    };

    return (
      <Card key={cardId} className={`h-full relative ${isEditMode ? 'border-2 border-dashed border-blue-400 cursor-move hover:shadow-lg transition-shadow' : ''}`}>
        <div className="p-4">
          {cardContent()}
        </div>
       </Card>
    );
  };

  // Only render cards that are visible
  const cardsToRender = useMemo(() => {
    return visibleCards.filter(cardId => AVAILABLE_CARDS.includes(cardId));
  }, [visibleCards]);

  return (
    <div className={`dashboard-container ${isEditMode ? 'edit-mode' : ''}`}>
      {/* Toolbar */}
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={toggleEditMode}
            className={`px-4 py-2 rounded transition-colors ${
              isEditMode 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isEditMode ? 'Save Layout' : 'Edit Layout'}
          </Button>
          {isEditMode && (
            <Button
              onClick={handleResetLayouts}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
              Reset to Default
            </Button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType={null} 
        preventCollision={false} 
       allowOverlap={false}
       margin={[12, 12]}
       containerPadding={[10, 10]}
       useCSSTransforms={true} 
       transformScale={1}
       verticalCompact={false} 
       autoSize={true}
       resizeHandles={['se', 'sw', 'ne', 'nw']}
      >
        {cardsToRender.map(cardId => renderCard(cardId))}
      </ResponsiveGridLayout>

      {/* Instructions when in edit mode */}
      {isEditMode && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Edit Mode Active:</strong> Drag cards by their handle to reposition them. 
            Resize cards by dragging their corners. Click "Save Layout" when done.
          </p>
        </div>
      )}
    </div>
  );
}
