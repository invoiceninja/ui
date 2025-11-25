# Fix: Eliminate Redundant Client/Vendor API Calls

## Branch
`fix/eliminate-redundant-client-vendor-api-calls`

## Problem Statement
When view-only users accessed invoices, the application was making unnecessary API calls to fetch client/vendor data even though this data was already available in the invoice relation (`invoice.client`, `invoice.vendor`). This caused:
- 401 errors for users without `view_client` permission
- Redundant API requests in normal operations
- Poor performance due to duplicate data fetching

## Root Cause
Two core hooks were always fetching client/vendor data via API without checking if it was already available:
1. `useGetCurrencySeparators` - Used for currency formatting in ProductsTable
2. `useResolveDateAndTimeClientFormat` - Used for date/time formatting in task invoicing

## Solution Implemented

### Core Hook Changes

**1. `src/common/hooks/useGetCurrencySeparators.ts`**
- Added optional generic `resource` parameter
- Checks `resource.client` or `resource.vendor` before calling API
- Falls back to company currency if client/vendor unavailable
- Handles permission errors gracefully with `.catch(() => null)`

**2. `src/pages/clients/common/hooks/useResolveDateAndTimeClientFormat.ts`**
- Added optional generic `resource` parameter
- Added optional `client` parameter to function signature
- Checks for client in resource relation or passed parameter
- Only fetches via API if client not available
- Handles permission errors gracefully

### Call Site Updates

**3. `src/pages/invoices/common/hooks/useResolveInputField.tsx`**
- Passes `resource` to `useGetCurrencySeparators`
- ProductsTable now uses client/vendor from invoice/purchase order relation

**4. `src/pages/tasks/common/hooks/useAddTasksOnInvoice.ts`**
- Passes `tasks[0]` as resource to both hooks
- Extracts and passes `tasks[0].client` to `resolveDateAndTimeClientFormat`

**5. `src/pages/tasks/common/hooks/useInvoiceTask.ts`**
- Extracts and passes `tasks[0].client` to `resolveDateAndTimeClientFormat`

## Impact

### Components Affected (All Improved)
- **Invoices** - Edit pages, ProductsTable
- **Purchase Orders** - Edit pages, ProductsTable (uses same component)
- **Quotes** - Edit pages, ProductsTable (uses same component)
- **Credits** - Edit pages, ProductsTable (uses same component)
- **Recurring Invoices** - ProductsTable (uses same component)
- **Task Invoicing** - Both "Add to Invoice" and "Create Invoice" flows

### API Call Reduction
- **Before:** Every ProductsTable render triggered 1-2 API calls
- **After:** Zero additional API calls when relation data is available
- **Task Invoicing:** Reduced from 2 API calls per operation to 0 when task.client is loaded

## Files Changed
1. `src/common/hooks/useGetCurrencySeparators.ts` (+50, -8)
2. `src/pages/clients/common/hooks/useResolveDateAndTimeClientFormat.ts` (+26, -6)
3. `src/pages/invoices/common/hooks/useResolveInputField.tsx` (+1, -1)
4. `src/pages/tasks/common/hooks/useAddTasksOnInvoice.ts` (+6, -2)
5. `src/pages/tasks/common/hooks/useInvoiceTask.ts` (+5, -2)

**Total:** 5 files, +88 insertions, -19 deletions

## Build Status
✅ TypeScript: Clean
✅ Vite Build: Success
✅ No eslint errors

## Backward Compatibility
✅ All changes are backward compatible
- New parameters are optional
- Existing call sites without resource parameter still work
- Fallback to API call when relations not available
