/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { matchPath } from 'react-router-dom';

export const invoiceDesignRoot = '/settings/invoice_design';
export const invoiceDesignsPath = `${invoiceDesignRoot}/custom_designs`;

export const invoiceDesignSettingsPaths = [
  invoiceDesignRoot,
  `${invoiceDesignRoot}/client_details`,
  `${invoiceDesignRoot}/company_details`,
  `${invoiceDesignRoot}/company_address`,
  `${invoiceDesignRoot}/invoice_details`,
  `${invoiceDesignRoot}/quote_details`,
  `${invoiceDesignRoot}/credit_details`,
  `${invoiceDesignRoot}/vendor_details`,
  `${invoiceDesignRoot}/purchase_order_details`,
  `${invoiceDesignRoot}/product_columns`,
  `${invoiceDesignRoot}/quote_product_columns`,
  `${invoiceDesignRoot}/task_columns`,
  `${invoiceDesignRoot}/total_fields`,
] as const;

export type InvoiceDesignRouteKind =
  | 'settings'
  | 'designs'
  | 'design-type'
  | 'template-gallery'
  | 'visual-builder-new'
  | 'visual-builder-edit'
  | 'legacy-create'
  | 'legacy-edit'
  | 'unknown';

function normalizePathname(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
}

export function getInvoiceDesignRouteKind(
  pathname: string
): InvoiceDesignRouteKind {
  const normalizedPathname = normalizePathname(pathname);

  if (invoiceDesignSettingsPaths.some((path) => path === normalizedPathname)) {
    return 'settings';
  }

  if (normalizedPathname === invoiceDesignsPath) {
    return 'designs';
  }

  if (normalizedPathname === `${invoiceDesignsPath}/new`) {
    return 'design-type';
  }

  if (normalizedPathname === `${invoiceDesignRoot}/builder/templates`) {
    return 'template-gallery';
  }

  if (normalizedPathname === `${invoiceDesignRoot}/builder/new`) {
    return 'visual-builder-new';
  }

  if (
    matchPath(
      { path: `${invoiceDesignRoot}/builder/:id`, end: true },
      normalizedPathname
    )
  ) {
    return 'visual-builder-edit';
  }

  if (normalizedPathname === `${invoiceDesignsPath}/create`) {
    return 'legacy-create';
  }

  if (
    matchPath(
      { path: `${invoiceDesignsPath}/:id/edit`, end: false },
      normalizedPathname
    )
  ) {
    return 'legacy-edit';
  }

  return 'unknown';
}

export function isInvoiceDesignBuilderRoute(kind: InvoiceDesignRouteKind) {
  return (
    kind === 'template-gallery' ||
    kind === 'visual-builder-new' ||
    kind === 'visual-builder-edit'
  );
}

export function isInvoiceDesignCreateRoute(kind: InvoiceDesignRouteKind) {
  return (
    kind === 'design-type' ||
    kind === 'template-gallery' ||
    kind === 'visual-builder-new' ||
    kind === 'legacy-create'
  );
}
