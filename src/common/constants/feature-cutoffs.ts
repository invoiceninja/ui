/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

// Accounts created on/after this date see the simplified invoice editor.
// Compared against CompanyUser.created_at (unix seconds).
export const SIMPLIFIED_INVOICE_EDITOR_CUTOFF = '2026-06-05';
