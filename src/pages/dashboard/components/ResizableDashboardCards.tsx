/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2024. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import '$app/resources/css/gridLayout.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useDebounce } from 'react-use';
import { useDispatch } from 'react-redux';
import { BiMove } from 'react-icons/bi';
import { MdDragHandle } from 'react-icons/md';

// React Grid Layout imports
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { Button, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { DropdownDateRangePicker } from '$app/components/DropdownDateRangePicker';
import { Card } from '$app/components/cards';
import { Spinner } from '$app/components/Spinner';

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { useReactSettings } from '$app/common/hooks/useReactSettings';


// Export DEFAULT_LAYOUTS for other components
export { DEFAULT_LAYOUTS };
import { CompanyUser } from '$app/common/interfaces/company-user';

import { RestoreCardsModal } from './RestoreCardsModal';
import { Chart } from './Chart';
import { Activity } from './Activity';
import { UpcomingInvoices } from './UpcomingInvoices';
import { PastDueInvoices } from './PastDueInvoices';
import { RecentPayments } from './RecentPayments';

interface Currency {
  value: string | number;
  label: string;
}

interface TotalsRecord {
  revenue: { paid_to_date: string; code: string };
  expenses: { amount: string; code: string };
  invoices: { invoiced_amount: string; code: string; date: string };
  outstanding: { outstanding_count: number; amount: string; code: string };
}

// Create ResponsiveGridLayout with WidthProvider
const ResponsiveGridLayout = WidthProvider(Responsive);

// Map react-grid-layout breakpoints
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };


// Default layouts for all breakpoints - simple visible cards
const DEFAULT_LAYOUTS: Layouts = {
  lg: [
    { i: 'toolbar', x: 0, y: 0, w: 12, h: 2, static: false },
    { i: 'totals', x: 0, y: 2, w: 12, h: 4, static: false },
    { i: 'chart', x: 0, y: 6, w: 6, h: 8, static: false },
    { i: 'activity', x: 6, y: 6, w: 6, h: 8, static: false },
    { i: 'recent_payments', x: 0, y: 14, w: 4, h: 8, static: false },
    { i: 'upcoming_invoices', x: 4, y: 14, w: 4, h: 8, static: false },
    { i: 'past_due_invoices', x: 8, y: 14, w: 4, h: 8, static: false },
  ],
  md: [
    { i: 'toolbar', x: 0, y: 0, w: 10, h: 2, static: false },
    { i: 'totals', x: 0, y: 2, w: 10, h: 4, static: false },
    { i: 'chart', x: 0, y: 6, w: 5, h: 8, static: false },
    { i: 'activity', x: 5, y: 6, w: 5, h: 8, static: false },
    { i: 'recent_payments', x: 0, y: 14, w: 5, h: 8, static: false },
    { i: 'upcoming_invoices', x: 5, y: 14, w: 5, h: 8, static: false },
    { i: 'past_due_invoices', x: 0, y: 22, w: 5, h: 8, static: false },
  ],
  sm: [
    { i: 'toolbar', x: 0, y: 0, w: 6, h: 2, static: false },
    { i: 'totals', x: 0, y: 2, w: 6, h: 4, static: false },
    { i: 'chart', x: 0, y: 6, w: 6, h: 8, static: false },
    { i: 'activity', x: 0, y: 14, w: 6, h: 8, static: false },
    { i: 'recent_payments', x: 0, y: 22, w: 6, h: 8, static: false },
    { i: 'upcoming_invoices', x: 0, y: 30, w: 6, h: 8, static: false },
    { i: 'past_due_invoices', x: 0, y: 38, w: 6, h: 8, static: false },
  ],
  xs: [
    { i: 'toolbar', x: 0, y: 0, w: 4, h: 2, static: false },
    { i: 'totals', x: 0, y: 2, w: 4, h: 4, static: false },
    { i: 'chart', x: 0, y: 6, w: 4, h: 8, static: false },
    { i: 'activity', x: 0, y: 14, w: 4, h: 8, static: false },
    { i: 'recent_payments', x: 0, y: 22, w: 4, h: 8, static: false },
    { i: 'upcoming_invoices', x: 0, y: 30, w: 4, h: 8, static: false },
    { i: 'past_due_invoices', x: 0, y: 38, w: 4, h: 8, static: false },
  ],
  xxs: [
    { i: 'toolbar', x: 0, y: 0, w: 2, h: 2, static: false },
    { i: 'totals', x: 0, y: 2, w: 2, h: 4, static: false },
    { i: 'chart', x: 0, y: 6, w: 2, h: 8, static: false },
    { i: 'activity', x: 0, y: 14, w: 2, h: 8, static: false },
    { i: 'recent_payments', x: 0, y: 22, w: 2, h: 8, static: false },
    { i: 'upcoming_invoices', x: 0, y: 30, w: 2, h: 8, static: false },
    { i: 'past_due_invoices', x: 0, y: 38, w: 2, h: 8, static: false },
  ],
};

export function ResizableDashboardCards() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const formatMoney = useFormatMoney();
  const user = useCurrentUser();
  const company = useCurrentCompany();
  const enabled = useEnabled();
  const reactSettings = useReactSettings();

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState<boolean>(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState<boolean>(false);
  const [layouts, setLayouts] = useState<Layouts>(DEFAULT_LAYOUTS);
  const [isDragging, setIsDragging] = useState(false);

  const [dateRange, setDateRange] = useState<string>('this_month');
  const [customDateRange, setCustomDateRange] = useState<[string, string]>(['', '']);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>('999');
  const [chartsView, setChartsView] = useState<string>('total');
  const [chartResults, setChartResults] = useState<Record<string, unknown>>({});
  const [currentDashboardFields, setCurrentDashboardFields] = useState<string[]>(['chart', 'activity', 'recent_payments', 'upcoming_invoices', 'past_due_invoices']);
  const [companyUser, setCompanyUser] = useState<CompanyUser>();


  // Query for dashboard data
  const { data: totalsResponse, isLoading: isTotalsLoading } = useQuery({
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

  const { data: chartResponse, isLoading: isChartLoading } = useQuery({
    queryKey: ['dashboard', 'chart', dateRange, customDateRange, chartsView],
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
    onSuccess: (data) => {
      setChartResults(data.data);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Load user dashboard settings
  useEffect(() => {
    if (user && company) {
      const cu = ((company as any).company_users || []).find((cu: any) => cu.user_id === user.id);
      if (cu) {
        setCompanyUser(cu);
        if (cu.settings?.dashboard_fields) {
          setCurrentDashboardFields(cu.settings.dashboard_fields);
        }
        
        // Load saved layouts if they exist
        if (cu.settings?.dashboard_layout) {
          try {
            const savedLayouts = JSON.parse(cu.settings.dashboard_layout);
            setLayouts(savedLayouts);
          } catch (e) {
            console.error('Failed to parse saved layouts:', e);
          }
        }
      }
    }
  }, [user, company]);

  // Save layout changes
  const saveLayouts = useCallback(
    async (newLayouts: Layouts) => {
      if (!companyUser) return;
      
      try {
        const settings = {
          ...companyUser.settings,
          dashboard_layout: JSON.stringify(newLayouts),
        };
        
        await request('PUT', endpoint('/api/v1/company_users/:id', { id: (companyUser as any).id }), {
          settings,
        });
        
        toast.success('Layout saved');
      } catch (error) {
        console.error('Failed to save layout:', error);
        toast.error('Error saving layout');
      }
    },
    [companyUser]
  );

  // Debounce layout saving
  useDebounce(
    () => {
      if (isEditMode && layouts !== DEFAULT_LAYOUTS) {
        saveLayouts(layouts);
      }
    },
    2000,
    [layouts, isEditMode]
  );

  const handleLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
  };

  const totals = useMemo(() => {
    if (!totalsResponse) return null;
    return (totalsResponse as any).data?.data as TotalsRecord;
  }, [totalsResponse]);

  const currencies = useMemo(() => {
    if (!totalsResponse) return [];
    const data = (totalsResponse as any).data?.data;
    if (!data?.currencies) return [];
    
    return Object.entries(data.currencies).map(([id, currency]: [string, any]) => ({
      value: id,
      label: `${currency.name} (${currency.code})`,
    }));
  }, [totalsResponse]);


  // Render individual cards
  const renderCard = (cardId: string) => {
    console.log('Rendering card:', cardId);
    
    switch (cardId) {
      case 'toolbar':
        return (
          <div className="h-full flex flex-col lg:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="flex gap-2 items-center flex-1">
              <Button
                behavior="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className="flex items-center gap-2"
              >
                <Icon element={isEditMode ? MdDragHandle : BiMove} size={18} />
                <span>{isEditMode ? 'Done Editing' : 'Edit Layout'}</span>
              </Button>
              
              {isEditMode && (
                <>
                  <Button
                    behavior="button"
                    onClick={() => setIsCardsModalOpen(true)}
                  >
                    Add Cards
                  </Button>
                  <Button onClick={() => setIsRestoreModalOpen(true)}>Restore Defaults</Button>
                </>
              )}
            </div>
            
            <div className="flex gap-2 items-center">
              <DropdownDateRangePicker
                value={dateRange}
                startDate={customDateRange[0]}
                endDate={customDateRange[1]}
                handleDateChange={setDateRange}
                handleDateRangeChange={(value) => setCustomDateRange([value, value])}
              />
              
              {currencies.length > 0 && (
                <SelectField
                  value={selectedCurrencyId}
                  onValueChange={setSelectedCurrencyId}
                  className="w-48"
                >
                  <option value="999">All</option>
                  {currencies.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>
          </div>
        );
        
      case 'totals':
        if (isTotalsLoading) {
          return (
            <Card height="full" className="flex items-center justify-center">
              <Spinner />
            </Card>
          );
        }
        
        if (!totals) {
          // Return a placeholder to show something is there
          return (
            <Card height="full" className="p-4">
              <div className="text-center text-gray-500">Loading totals...</div>
            </Card>
          );
        }
        
        return (
          <Card height="full" className="p-4 overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full items-center">
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatMoney(parseFloat(totals.revenue.paid_to_date || '0'), totals.revenue.code, company?.settings?.country_id)}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Expenses</div>
                <div className="text-2xl font-bold text-red-600">
                  {formatMoney(parseFloat(totals.expenses.amount || '0'), totals.expenses.code, company?.settings?.country_id)}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Invoiced</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatMoney(parseFloat(totals.invoices.invoiced_amount || '0'), totals.invoices.code, company?.settings?.country_id)}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Outstanding</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatMoney(parseFloat(totals.outstanding.amount || '0'), totals.outstanding.code, company?.settings?.country_id)}
                </div>
                <div className="text-xs text-gray-500">
                  {totals.outstanding.outstanding_count || 0} invoices
                </div>
              </div>
            </div>
          </Card>
        );
        
      case 'chart':
        // Temporarily always show for debugging
      // if (!currentDashboardFields.includes(DashboardField.DashChart)) return null;
       // Don't render chart if we don't have chart data with proper structure
       if (!chartResults || typeof chartResults !== 'object' || !('invoices' in chartResults)) {
         return (
           <Card height="full">
             <div className="flex items-center justify-center h-full text-gray-500">
               Loading chart data...
             </div>
           </Card>
         );
       }
       
       // Calculate proper date range from dateRange or customDateRange
       let chartDates: { start_date: string; end_date: string };
       {
         if (dateRange === 'custom' && customDateRange[0] && customDateRange[1]) {
           chartDates = { start_date: customDateRange[0], end_date: customDateRange[1] };
         } else {
           // For non-custom ranges, compute dates from current date
           const now = new Date();
           let end = new Date();
           let start = new Date();
           
           switch (dateRange) {
             case 'this_month':
               start.setDate(1);
               break;
             case 'last_month': {
               start.setMonth(start.getMonth() - 1);
               start.setDate(1);
               end.setMonth(end.getMonth() - 1);
               const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0);
               end.setDate(lastDay.getDate());
               break;
             }
             case 'this_year':
               start = new Date(now.getFullYear(), 0, 1);
               break;
             case 'last_year':
               start = new Date(now.getFullYear() - 1, 0, 1);
               end = new Date(now.getFullYear() - 1, 11, 31);
               break;
             default:
               // Default to this month
               start.setDate(1);
           }
           
           chartDates = {
             start_date: start.toISOString().split('T')[0],
             end_date: end.toISOString().split('T')[0],
           };
         }
       }
       
      return (
      <Card height="full">
        <Chart
           data={chartResults as any}
           dates={chartDates}
           currency={company?.settings?.currency_id || ''}
            chartSensitivity="day"
        />
       </Card>
       );
        
      case 'activity':
        // Temporarily always show for debugging
        // if (!currentDashboardFields.includes(DashboardField.DashActivity)) return null;
        return (
          <Card height="full" withScrollableBody>
            <Activity isEditMode={isEditMode} />
          </Card>
        );
        
      case 'recent_payments':
        // Temporarily always show for debugging
        // if (!currentDashboardFields.includes(DashboardField.DashRecentPayments)) return null;
        return (
          <Card height="full" withScrollableBody>
            <RecentPayments isEditMode={isEditMode} />
          </Card>
        );
        
      case 'upcoming_invoices':
        // Temporarily always show for debugging
       // if (!currentDashboardFields.includes(DashboardField.DashUpcomingInvoices)) return null;
       return (
         <Card height="full" withScrollableBody>
            <UpcomingInvoices isEditMode={isEditMode} />
         </Card>
       );
        
      case 'past_due_invoices':
        // Temporarily always show for debugging
       // if (!currentDashboardFields.includes(DashboardField.DashPastDueInvoices)) return null;
       return (
         <Card height="full" withScrollableBody>
            <PastDueInvoices isEditMode={isEditMode} />
         </Card>
       );
        
      default:
        return (
          <Card className="h-full flex items-center justify-center">
            <span className="text-gray-400">Unknown Card: {cardId}</span>
          </Card>
        );
    }
  };


  // Use state to manage window width for SSR compatibility
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  
  useEffect(() => {
    // Set initial width on client mount
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      
      // Update on resize
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Get all card IDs from current layout
  const cardIds = useMemo(() => {
    // Default to lg breakpoint for SSR or initial render
    const width = windowWidth ?? 1200;
    const currentBreakpoint = width >= 1200 ? 'lg' : 
                            width >= 996 ? 'md' :
                            width >= 768 ? 'sm' :
                            width >= 480 ? 'xs' : 'xxs';
    const currentLayout = layouts[currentBreakpoint] || layouts.lg || [];
    return currentLayout.map(item => item.i);
  }, [layouts, windowWidth]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {/* Debug Info */}
      <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
        <div className="text-sm">
          Debug: Edit Mode = {isEditMode ? 'ON' : 'OFF'}, 
          Cards to render = {cardIds.join(', ')}
        </div>
      </div>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={30}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        preventCollision={false}
        compactType={null}
        verticalCompact={false}
        allowOverlap={true}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onDragStart={() => setIsDragging(true)}
        onDragStop={() => setIsDragging(false)}
        onResizeStart={() => setIsDragging(true)}
        onResizeStop={() => setIsDragging(false)}
        useCSSTransforms={true}
      >
        {cardIds.map((cardId) => {
          const content = renderCard(cardId);
          
          if (!content) {
            console.log('Card returned null:', cardId);
            return null;
          }
          
          return (
            <div
              key={cardId}
              style={{
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: isEditMode ? '2px dashed #ccc' : 'none',
                padding: isEditMode ? '4px' : '0',
              }}
              className={classNames(
                'dashboard-grid-item',
                {
                  'cursor-move': isEditMode,
                  'pointer-events-none': isDragging,
                }
              )}
            >
              {content}
            </div>
          );
        })}
      </ResponsiveGridLayout>
      
      {/* Always show test cards to verify grid is working */}
      {cardIds.length === 0 && (
        <div className="mt-8 p-4 bg-red-100 dark:bg-red-900 rounded">
          <h3 className="text-lg font-bold mb-2">No cards in layout!</h3>
          <p>This is a fallback to show the grid is working.</p>
        </div>
      )}
      
      {/* Modals */}
      
      {isRestoreModalOpen && (
        <RestoreCardsModal
          layoutBreakpoint={'lg'}
          setLayouts={setLayouts}
          setAreCardsRestored={() => {
            setLayouts(DEFAULT_LAYOUTS);
            setIsRestoreModalOpen(false);
            toast.success('Layout restored');
          }}
        />
      )}
    </div>
  );
}
