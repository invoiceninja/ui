/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

// Export only the used DocuNinja guards
export * from './permission';

// Re-export the main guard component and types
export { DocuNinjaGuard } from '../../DocuNinjaGuard';
export type { DocuNinjaGuard as DocuNinjaGuardType, DocuNinjaContext, DocuNinjaPermission } from '../../DocuNinjaGuard';
