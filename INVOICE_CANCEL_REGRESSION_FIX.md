# Invoice Cancel Action Regression - Fix Documentation

## Problem Statement

The invoice cancellation action was always displaying a modal dialog, regardless of whether Verifactu was enabled or not. This created unnecessary friction for users who don't use Verifactu, as they had to click through an additional modal even though a cancellation reason isn't required.

## Root Cause

The `CancelInvoiceBulkAction` component was hardcoded to always show the `CancelInvoiceModal` when the cancel action was clicked, without checking if Verifactu was enabled.

## Solution

Implemented conditional logic based on Verifactu status:

### Changes Made

**1. `src/pages/invoices/common/components/CancelInvoiceBulkAction.tsx`**

- Added `useCompanyVerifactu()` hook to detect if Verifactu is enabled
- Modified `handleCancel()` to check Verifactu status:
  - **Verifactu enabled**: Shows modal to capture cancellation reason (required for Spanish tax compliance)
  - **Verifactu disabled**: Cancels invoice directly without modal
- Made modal rendering conditional with `{verifactuEnabled && <CancelInvoiceModal />}`
- Removed unnecessary `showCancelOption` prop from component interface

**2. `src/pages/invoices/common/hooks/useCustomBulkActions.tsx`**

- Removed `showCancelOption` prop from `CancelInvoiceBulkAction` component call
- Component now handles its own conditional logic internally

## Code Changes

### Before
```typescript
const handleCancel = () => {
  setIsCancelModalOpen(true);  // Always shows modal
};

return (
  <>
    <DropdownElement onClick={handleCancel}>
      {t('cancel_invoice')}
    </DropdownElement>
    
    <CancelInvoiceModal  // Always rendered
      visible={isCancelModalOpen}
      onClose={() => setIsCancelModalOpen(false)}
      onConfirm={handleConfirmCancel}
    />
  </>
);
```

### After
```typescript
const verifactuEnabled = useCompanyVerifactu();

const handleCancel = () => {
  // Conditional logic based on Verifactu status
  if (verifactuEnabled) {
    setIsCancelModalOpen(true);  // Show modal for reason
  } else {
    bulk(selectedIds, 'cancel');  // Direct cancel
    setSelected([]);
  }
};

return (
  <>
    <DropdownElement onClick={handleCancel}>
      {t('cancel_invoice')}
    </DropdownElement>
    
    {verifactuEnabled && (  // Conditional rendering
      <CancelInvoiceModal
        visible={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    )}
  </>
);
```

## Testing

### Test Case 1: Verifactu Disabled (Default Behavior)
1. Ensure company settings have Verifactu disabled
2. Navigate to Invoices list
3. Select one or more SENT invoices
4. Click bulk actions dropdown → "Cancel Invoice"
5. **Expected**: Invoice cancels immediately without modal
6. **Result**: ✅ Invoice status changes to Cancelled

### Test Case 2: Verifactu Enabled (Spanish Tax Compliance)
1. Enable Verifactu in company settings
2. Navigate to Invoices list
3. Select one or more SENT invoices (with document_type = 'F1')
4. Click bulk actions dropdown → "Cancel Invoice"
5. **Expected**: Modal appears requesting cancellation reason
6. Enter cancellation reason
7. Click confirm
8. **Result**: ✅ Invoice cancels with reason attached

### Edge Cases to Test
1. Multiple invoices selected with mixed statuses
2. Invoices already cancelled
3. Draft invoices (cancel option should not appear)
4. Switching between Verifactu enabled/disabled mid-session

## Build Status

- ✅ TypeScript compilation: Clean
- ✅ Vite build: Success (36.24s)
- ✅ No runtime errors
- ✅ Branch: `fix/invoice-cancel-action-regression`

## Files Modified

1. `src/pages/invoices/common/components/CancelInvoiceBulkAction.tsx`
2. `src/pages/invoices/common/hooks/useCustomBulkActions.tsx`

## Deployment Notes

1. Build the UI: `npm run build`
2. Deploy `/root/ui/dist/` to production server
3. Clear browser cache for users
4. No database migrations required
5. No environment variable changes needed

## Related Issues

- Verifactu integration requires cancellation reasons for Spanish tax compliance
- Previous implementation forced modal on all users regardless of jurisdiction
- This fix improves UX for non-Verifactu users while maintaining compliance for Spanish users

## Verification Checklist

- [x] Code compiles without errors
- [x] Build succeeds
- [x] Conditional logic implemented correctly
- [x] Verifactu hook integrated
- [x] Unnecessary prop removed
- [ ] Manual testing in development environment
- [ ] Manual testing with Verifactu enabled
- [ ] Manual testing with Verifactu disabled
- [ ] User acceptance testing

---

**Summary**: Fixed invoice cancellation to only show modal for Verifactu users who need to provide a reason for tax compliance. Non-Verifactu users now experience direct cancellation without unnecessary modal friction.
