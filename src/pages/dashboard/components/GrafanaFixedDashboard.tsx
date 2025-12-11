/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
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
const DEFAULT_LAYOUTS: any = {
  lg: [
    { i: 'totals', x: 0, y: 0, w: 12, h: 4, minW: 4, minH: 3, static: false },
    { i: 'chart', x: 0, y: 4, w: 12, h: 6, minW: 4, minH: 4, static: false },
    { i: 'activity', x: 0, y: 10, w: 6, h: 5, minW: 3, minH: 3, static: false },
    { i: 'recent_payments', x: 6, y: 10, w: 6, h: 5, minW: 3, minH: 3, static: false },
    { i: 'upcoming_invoices', x: 0, y: 15, w: 4, h: 5, minW: 2, minH: 3, static: false },
    { i: 'past_due_invoices', x: 4, y: 15, w: 4, h: 5, minW: 2, minH: 3, static: false },
    { i: 'expired_quotes', x: 8, y: 15, w: 4, h: 5, minW: 2, minH: 3, static: false },
    { i: 'upcoming_quotes', x: 0, y: 20, w: 6, h: 5, minW: 3, minH: 3, static: false },
    { i: 'upcoming_recurring_invoices', x: 6, y: 20, w: 6, h: 5, minW: 3, minH: 3, static: false },
  ],
  md: [
    { i: 'totals', x: 0, y: 0, w: 10, h: 4, minW: 4, minH: 3, static: false },
    { i: 'chart', x: 0, y: 4, w: 10, h: 6, minW: 4, minH: 4, static: false },
    { i: 'activity', x: 0, y: 10, w: 5, h: 5, minW: 3, minH: 3, static: false },
    { i: 'recent_payments', x: 5, y: 10, w: 5, h: 5, minW: 3, minH: 3, static: false },
    { i: 'upcoming_invoices', x: 0, y: 15, w: 5, h: 5, minW: 2, minH: 3, static: false },
    { i: 'past_due_invoices', x: 5, y: 15, w: 5, h: 5, minW: 2, minH: 3, static: false },
    { i: 'expired_quotes', x: 0, y: 20, w: 5, h: 5, minW: 2, minH: 3, static: false },
    { i: 'upcoming_quotes', x: 5, y: 20, w: 5, h: 5, minW: 3, minH: 3, static: false },
    { i: 'upcoming_recurring_invoices', x: 0, y: 25, w: 10, h: 5, minW: 3, minH: 3, static: false },
  ],
  sm: [
    { i: 'totals', x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3, static: false },
    { i: 'chart', x: 0, y: 4, w: 6, h: 6, minW: 3, minH: 4, static: false },
    { i: 'activity', x: 0, y: 10, w: 6, h: 5, minW: 3, minH: 3, static: false },
    { i: 'recent_payments', x: 0, y: 15, w: 6, h: 5, minW: 3, minH: 3, static: false },
    { i: 'upcoming_invoices', x: 0, y: 20, w: 3, h: 5, minW: 2, minH: 3, static: false },
    { i: 'past_due_invoices', x: 3, y: 20, w: 3, h: 5, minW: 2, minH: 3, static: false },
    { i: 'expired_quotes', x: 0, y: 25, w: 3, h: 5, minW: 2, minH: 3, static: false },
    { i: 'upcoming_quotes', x: 3, y: 25, w: 3, h: 5, minW: 2, minH: 3, static: false },
    { i: 'upcoming_recurring_invoices', x: 0, y: 30, w: 6, h: 5, minW: 3, minH: 3, static: false },
  ],
  xs: [
    { i: 'totals', x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 3, static: false },
    { i: 'chart', x: 0, y: 4, w: 4, h: 6, minW: 2, minH: 4, static: false },
    { i: 'activity', x: 0, y: 10, w: 4, h: 5, minW: 2, minH: 3, static: false },
    { i: 'recent_payments', x: 0, y: 15, w: 4, h: 5, minW: 2, minH: 3, static: false },
    { i: 'upcoming_invoices', x: 0, y: 20, w: 4, h: 5, minW: 2, minH: 3, static: false },
    { i: 'past_due_invoices', x: 0, y: 25, w: 4, h: 5, minW: 2, minH: 3, static: false },
    { i: 'expired_quotes', x: 0, y: 30, w: 4, h: 5, minW: 2, minH: 3, static: false },
    { i: 'upcoming_quotes', x: 0, y: 35, w: 4, h: 5, minW: 2, minH: 3, static: false },
    { i: 'upcoming_recurring_invoices', x: 0, y: 40, w: 4, h: 5, minW: 2, minH: 3, static: false },
  ],
  xxs: [
    { i: 'totals', x: 0, y: 0, w: 2, h: 4, minW: 2, minH: 3, static: false },
    { i: 'chart', x: 0, y: 4, w: 2, h: 6, minW: 2, minH: 4, static: false },
    { i: 'activity', x: 0, y: 10, w: 2, h: 5, minW: 2, minH: 3, static: false },
    { i: 'recent_payments', x: 0, y: 15, w: 2, h: 5, minW: 2, minH: 3, static: false },
    { i: 'upcoming_invoices', x: 0, y: 20, w: 2, h: 5, minW: 2, minH: 3, static: false },
    { i: 'past_due_invoices', x: 0, y: 25, w: 2, h: 5, minW: 2, minH: 3, static: false },
    { i: 'expired_quotes', x: 0, y: 30, w: 2, h: 5, minW: 2, minH: 3, static: false },
    { i: 'upcoming_quotes', x: 0, y: 35, w: 2, h: 5, minW: 2, minH: 3, static: false },
    { i: 'upcoming_recurring_invoices', x: 0, y: 40, w: 2, h: 5, minW: 2, minH: 3, static: false },
  ]
};

export default function GrafanaFixedDashboard() {
  const [visibleCards, setVisibleCards] = useState(AVAILABLE_CARDS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<any>(DEFAULT_LAYOUTS);
  const [justDropped, setJustDropped] = useState(false);
  const dropTimeoutRef = useRef<NodeJS.Timeout>();

  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

  // Fetch totals data
  const { data: totalsResponse, isLoading: totalsLoading } = useQuery({
    queryKey: ['dashboard', 'totals'],
    queryFn: () => request('GET', endpoint('/api/v1/dashboard'))  
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard', 'chart'],
    queryFn: () => request('GET', endpoint('/api/v1/charts/chart_summary'))
  });

  const totals = totalsResponse?.data || {};

  // Update static property when edit mode changes
  useEffect(() => {
    if (justDropped) {
      return; // Don't update layouts during drop
    }

    const updatedLayouts: any = {};
    
    Object.keys(layouts).forEach(breakpoint => {
      updatedLayouts[breakpoint] = layouts[breakpoint].map((item: any) => ({
        ...item,
        static: !isEditMode
      }));
    });
    
    setLayouts(updatedLayouts);
  }, [isEditMode]);

  const handleLayoutChange = useCallback((layout: any, allLayouts: any) => {
    // Ignore layout changes immediately after drop to prevent position override
    if (justDropped) {
      console.log('Ignoring layout change - just dropped');
      return;
    }
    
    console.log('Layout changed', allLayouts);
    setLayouts(allLayouts);
  }, [justDropped]);

  const handleDragStart = useCallback(() => {
    console.log('Drag started');
    setJustDropped(true);
    
    // Clear any existing timeout
    if (dropTimeoutRef.current) {
      clearTimeout(dropTimeoutRef.current);
    }
  }, []);

  const handleDragStop = useCallback(() => {
    console.log('Drag stopped');
    
    // Keep the justDropped flag active for a short time to prevent immediate layout updates
    dropTimeoutRef.current = setTimeout(() => {
      setJustDropped(false);
      console.log('Reset justDropped flag');
    }, 200);
  }, []);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleResetLayouts = () => {
    setLayouts(DEFAULT_LAYOUTS);
    setVisibleCards(AVAILABLE_CARDS);
  };

  const renderCard = (cardId: string) => {
    const cardContent = () => {
      switch (cardId) {
        case 'totals':
          if (totalsLoading) {
            return <Spinner />;
          }
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatMoney(parseFloat(totals.active?.amount || '0'), totals.active?.code, company?.settings?.country_id)}
                </div>
                <div className="text-xs text-gray-500">
                  {totals.active?.active_invoices || 0} invoices
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Overdue</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatMoney(parseFloat(totals.overdue?.amount || '0'), totals.overdue?.code, company?.settings?.country_id)}
                </div>
                <div className="text-xs text-gray-500">
                  {totals.overdue?.overdue_invoices || 0} invoices
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatMoney(parseFloat(totals.completed?.amount || '0'), totals.completed?.code, company?.settings?.country_id)}
                </div>
                <div className="text-xs text-gray-500">
                  {totals.completed?.completed_payments || 0} payments
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

        case 'chart': {
          // Ensure chart data has the expected structure
          if (chartLoading) {
            return <Spinner />;
          }
          
          // Create safe chart data with default empty arrays if properties don't exist
          const safeChartData = {
            invoices: chartData?.data?.invoices || [],
            outstanding: chartData?.data?.outstanding || [],
            payments: chartData?.data?.payments || [],
            expenses: chartData?.data?.expenses || [],
            ...chartData?.data
          };
          
          return (
            <Chart
              data={safeChartData}
              dates={{ start_date: '', end_date: '' }}
              currency={company?.settings?.currency_id || 'USD'}
              chartSensitivity="day"
            />
          );
        }

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
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType={null} // CRITICAL: Disable auto-compaction for free positioning
        verticalCompact={false} // CRITICAL: Explicitly disable vertical compaction  
        allowOverlap={true} // Allow free positioning with overlaps
        preventCollision={false} // Don't prevent collisions for smoother movement
        margin={[12, 12]}
        containerPadding={[10, 10]}
        useCSSTransforms={true} // Better performance with CSS transforms
        transformScale={1}
        autoSize={false} // Don't auto-size container
        resizeHandles={['se', 'sw', 'ne', 'nw']}
      >
        {cardsToRender.map(cardId => renderCard(cardId))}
      </ResponsiveGridLayout>

      {/* Instructions when in edit mode */}
      {isEditMode && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Edit Mode Active:</strong> Drag cards to reposition them. 
            Cards will swap positions when you drag one over another.
            Resize cards by dragging their corners. Click &quot;Save Layout&quot; when done.
          </p>
        </div>
      )}
    </div>
  );
}
