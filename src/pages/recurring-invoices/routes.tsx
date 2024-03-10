/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Guard } from '$app/common/guards/Guard';
import { assigned } from '$app/common/guards/guards/assigned';
import { enabled } from '$app/common/guards/guards/enabled';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { Route } from 'react-router-dom';
import { lazy } from 'react';

const Import = lazy(
  () => import('$app/pages/recurring-invoices/import/Import')
);
const RecurringInvoices = lazy(
  () => import('$app/pages/recurring-invoices/index/RecurringInvoices')
);
const Create = lazy(
  () => import('$app/pages/recurring-invoices/create/Create')
);
const Edit = lazy(() => import('$app/pages/recurring-invoices/edit/Edit'));
const Pdf = lazy(() => import('$app/pages/recurring-invoices/pdf/Pdf'));

export const recurringInvoiceRoutes = (
  <Route path="/recurring_invoices">
    <Route
      path=""
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.RecurringInvoices),
            or(
              permission('view_recurring_invoice'),
              permission('create_recurring_invoice'),
              permission('edit_recurring_invoice')
            ),
          ]}
          component={<RecurringInvoices />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.RecurringInvoices),
            permission('create_recurring_invoice'),
          ]}
          component={<Create />}
        />
      }
    />
    <Route path=":id">
      <Route
        path="edit"
        element={
          <Guard
            guards={[
              enabled(ModuleBitmask.RecurringInvoices),
              or(
                permission('edit_recurring_invoice'),
                permission('view_recurring_invoice'),
                assigned('/api/v1/recurring_invoices/:id')
              ),
            ]}
            component={<Edit />}
          />
        }
      />
      <Route
        path="pdf"
        element={
          <Guard
            guards={[
              enabled(ModuleBitmask.RecurringInvoices),
              or(
                permission('edit_recurring_invoice'),
                assigned('/api/v1/recurring_invoices/:id')
              ),
            ]}
            component={<Pdf />}
          />
        }
      />
    </Route>
    <Route
      path="import"
      element={
        <Guard
          guards={[
            enabled(ModuleBitmask.Invoices),
            or(
              permission('create_recurring_invoice'),
              permission('edit_recurring_invoice')
            ),
          ]}
          component={<Import />}
        />
      }
    />
  </Route>
);
