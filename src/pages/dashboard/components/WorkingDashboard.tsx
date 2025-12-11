/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState, useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useQuery } from 'react-query';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { DropdownDateRangePicker } from '$app/components/DropdownDateRangePicker';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { BiMove } from 'react-icons/bi';
import { MdDragHandle } from 'react-icons/md';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { Chart } from './Chart';
import { Activity } from './Activity';
import { RecentPayments } from './RecentPayments';
import { UpcomingInvoices } from './UpcomingInvoices';
import { PastDueInvoices } from './PastDueInvoices';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Grafana-like layouts - using minimal cards for now
const DEFAULT_LAYOUTS = {
  lg: [
    { i: 'toolbar', x: 0, y: 0, w: 12, h: 1, static: false, minW: 4, minH: 1 },
    { i: 'totals', x: 0, y: 1, w: 12, h: 2, static: false, minW: 4, minH: 2 },
    { i: 'chart', x: 0, y: 3, w: 6, h: 6, static: false, minW: 3, minH: 4 },
    { i: 'activity', x: 6, y: 3, w: 6, h: 6, static: false, minW: 3, minH: 4 },
    { i: 'recent_payments', x: 0, y: 9, w: 4, h: 5, static: false, minW: 2, minH: 3 },
    { i: 'upcoming_invoices', x: 4, y: 9, w: 4, h: 5, static: false, minW: 2, minH: 3 },
    { i: 'past_due_invoices', x: 8, y: 9, w: 4, h: 5, static: false, minW: 2, minH: 3 },
  ],
  md: [
    { i: 'toolbar', x: 0, y: 0, w: 10, h: 1, static: false, minW: 4, minH: 1 },
    { i: 'totals', x: 0, y: 1, w: 10, h: 2, static: false, minW: 4, minH: 2 },
    { i: 'chart', x: 0, y: 3, w: 5, h: 6, static: false, minW: 3, minH: 4 },
    { i: 'activity', x: 5, y: 3, w: 5, h: 6, static: false, minW: 3, minH: 4 },
    { i: 'recent_payments', x: 0, y: 9, w: 5, h: 5, static: false, minW: 2, minH: 3 },
    { i: 'upcoming_invoices', x: 5, y: 9, w: 5, h: 5, static: false, minW: 2, minH: 3 },
    { i: 'past_due_invoices', x: 0, y: 14, w: 5, h: 5, static: false, minW: 2, minH: 3 },
  ],
  sm: [
    { i: 'toolbar', x: 0, y: 0, w: 6, h: 1, static: false },
    { i: 'totals', x: 0, y: 1, w: 6, h: 2, static: false },
    { i: 'chart', x: 0, y: 3, w: 6, h: 6, static: false },
    { i: 'activity', x: 0, y: 9, w: 6, h: 6, static: false },
    { i: 'recent_payments', x: 0, y: 15, w: 6, h: 5, static: false },
    { i: 'upcoming_invoices', x: 0, y: 20, w: 6, h: 5, static: false },
    { i: 'past_due_invoices', x: 0, y: 25, w: 6, h: 5, static: false },
  ],
};

export function WorkingDashboard() {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const user = useCurrentUser();
  const reactSettings = useReactSettings();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
  const [dateRange, setDateRange] = useState('this_month');
  const [customDateRange, setCustomDateRange] = useState<[string, string]>(['', '']);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState('999');
  
  // Query for dashboard totals data - real API call
  const { data: totalsData, isLoading: isTotalsLoading } = useQuery({
    queryKey: ['dashboard', 'totals', dateRange, customDateRange, selectedCurrencyId],
    queryFn: () => {
      let url = `/api/v1/dashboard?currency_id=${selectedCurrencyId}`;
      
      if (dateRange && dateRange !== 'custom') {
        url += `&date_range=${dateRange}`;
      }
      
      if (dateRange === 'custom' && customDateRange[0] && customDateRange[1]) {
        url += `&start_date=${customDateRange[0]}&end_date=${customDateRange[1]}`;
      }
      
      return request('GET', endpoint(url));
    },
    staleTime: 5 * 60 * 1000,
  });
  
  // Query for chart data - real API call
  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ['dashboard', 'chart', dateRange, customDateRange],
    queryFn: () => {
      let url = `/api/v1/charts/chart_summary`;
      const params = new URLSearchParams();
      
      if (dateRange && dateRange !== 'custom') {
        params.append('date_range', dateRange);
      }
      
      if (dateRange === 'custom' && customDateRange[0] && customDateRange[1]) {
        params.append('start_date', customDateRange[0]);
        params.append('end_date', customDateRange[1]);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      return request('GET', endpoint(url));
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleLayoutChange = (_: Layout[], allLayouts: any) => {
    setLayouts(allLayouts);
    console.log('Layout changed:', allLayouts);
  };

  // Available currencies from user data
  const currencies = useMemo(() => {
    const result = [
      { value: '999', label: t('all') },
    ];
    
    if (company?.settings?.currency_id) {
      result.push({
        value: company.settings.currency_id,
        label: company.settings.currency_id,
      });
    }
    
    return result;
  }, [company, t]);

  const renderCard = (cardId: string) => {
    switch (cardId) {
      case 'toolbar':
        return (
          <div className="h-full flex items-center gap-2 px-2">
            <Button
              onClick={() => setIsEditMode(!isEditMode)}
              className="flex items-center gap-1"
            >
              <Icon element={isEditMode ? MdDragHandle : BiMove} size={16} />
              <span className="text-sm">{isEditMode ? 'Done' : 'Edit'}</span>
            </Button>
            
            <div className="ml-auto flex items-center gap-2">
              <DropdownDateRangePicker
                value={dateRange}
                startDate={customDateRange[0]}
                endDate={customDateRange[1]}
                handleDateChange={setDateRange}
                handleDateRangeChange={(value) => setCustomDateRange([value, value])}
              />
              
              <Dropdown label={selectedCurrencyId === '999' ? t('all') : selectedCurrencyId}>
                {currencies.map((currency) => (
                  <DropdownElement
                    key={currency.value}
                    onClick={() => setSelectedCurrencyId(String(currency.value))}
                  >
                    {currency.label}
                  </DropdownElement>
                ))}
              </Dropdown>
            </div>
          </div>
        );
        
      case 'totals':
        const totals = totalsData?.data?.data;
        if (!totals) {
          return (
            <Card className="h-full p-2">
              <div className="text-center text-gray-500">Loading totals...</div>
            </Card>
          );
        }
        
        return (
          <Card className="h-full p-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 h-full">
              <div className="flex flex-col justify-center">
                <div className="text-xs text-gray-500">Revenue</div>
                <div className="text-lg font-bold text-green-600">
                  {formatMoney(
                    parseFloat(totals.revenue?.paid_to_date || '0'),
                    totals.revenue?.code,
                    company?.settings?.country_id
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-xs text-gray-500">Expenses</div>
                <div className="text-lg font-bold text-red-600">
                  {formatMoney(
                    parseFloat(totals.expenses?.amount || '0'),
                    totals.expenses?.code,
                    company?.settings?.country_id
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-xs text-gray-500">Invoiced</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatMoney(
                    parseFloat(totals.invoices?.invoiced_amount || '0'),
                    totals.invoices?.code,
                    company?.settings?.country_id
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-xs text-gray-500">Outstanding</div>
                <div className="text-lg font-bold text-orange-600">
                  {formatMoney(
                    parseFloat(totals.outstanding?.amount || '0'),
                    totals.outstanding?.code,
                    company?.settings?.country_id
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {totals.outstanding?.outstanding_count || 0} invoices
                </div>
              </div>
            </div>
          </Card>
        );
        
      case 'chart':
        return (
          <Card className="h-full">
            <Chart
              data={chartData?.data as any}
              dates={{ start_date: customDateRange[0], end_date: customDateRange[1] }}
              currency={selectedCurrencyId}
              chartSensitivity={'month' as const}
            />
          </Card>
        );
        
      case 'activity':
        return (
          <Card className="h-full overflow-hidden">
            <Activity isEditMode={false} />
          </Card>
        );
        
      case 'recent_payments':
        return (
          <Card className="h-full overflow-hidden">
            <RecentPayments isEditMode={false} />
          </Card>
        );
        
      case 'upcoming_invoices':
        return (
          <Card className="h-full overflow-hidden">
            <UpcomingInvoices isEditMode={false} />
          </Card>
        );
        
      case 'past_due_invoices':
        return (
          <Card className="h-full overflow-hidden">
            <PastDueInvoices isEditMode={false} />
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType={null}  // Grafana-like: no auto-compacting
        preventCollision={false}  // Grafana-like: allows overlapping during drag
        allowOverlap={false}  // But don't allow overlap on drop
        margin={[12, 12]}
        useCSSTransforms={true}
      >
        {(layouts.lg || []).map((layout) => {
          const cardId = layout.i;
          const content = renderCard(cardId);
          
          if (!content) return null;
          
          return (
            <div
              key={cardId}
              className={`dashboard-card ${
                isEditMode ? 'cursor-move border-2 border-dashed border-gray-400 rounded' : ''
              }`}
              style={{
                transition: isEditMode ? 'none' : 'all 0.2s ease',
              }}
            >
              {content}
            </div>
          );
        })}
      </ResponsiveGridLayout>
      
      {/* Add custom CSS for Grafana-like behavior */}
      <style>{`
        .react-grid-item.react-grid-placeholder {
          background-color: rgba(59, 130, 246, 0.15);
          border: 2px dashed #3b82f6;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }
        
        .react-grid-item.resizing,
        .react-grid-item.cssTransforms.resizing {
          transition: none;
          z-index: 100;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .react-grid-item.dragging,
        .react-grid-item.cssTransforms.dragging {
          transition: none;
          z-index: 100;
          opacity: 0.9;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .dashboard-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
