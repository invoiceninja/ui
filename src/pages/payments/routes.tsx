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
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { admin } from '$app/common/guards/guards/admin';

const Payment = lazy(() => import('$app/pages/payments/Payment'));
const Payments = lazy(() => import('$app/pages/payments/index/Payments'));
const Create = lazy(() => import('$app/pages/payments/create/Create'));
const Edit = lazy(() => import('$app/pages/payments/edit/Edit'));
const Documents = lazy(() => import('$app/pages/payments/documents/Documents'));
const PaymentFields = lazy(
  () => import('$app/pages/payments/edit/PaymentFields')
);
const Apply = lazy(() => import('$app/pages/payments/apply/Apply'));
const Refund = lazy(() => import('$app/pages/payments/refund/Refund'));

export const paymentRoutes = (
  <Route path="/payments">
    <Route
      path=""
      element={
        <Guard
          guards={[
            or(
              permission('view_payment'),
              permission('create_payment'),
              permission('edit_payment')
            ),
          ]}
          component={<Payments />}
        />
      }
    />
    <Route
      path="create"
      element={
        <Guard guards={[permission('create_payment')]} component={<Create />} />
      }
    />
    <Route
      path=":id"
      element={
        <Guard
          guards={[
            or(permission('edit_payment'), assigned('/api/v1/payments/:id')),
          ]}
          component={<Payment />}
        />
      }
    >
      <Route path="apply" element={<Apply />} />
      <Route path="refund" element={<Refund />} />
    </Route>
    <Route
      path=":id"
      element={
        <Guard
          guards={[
            or(
              permission('view_payment'),
              permission('edit_payment'),
              assigned('/api/v1/payments/:id')
            ),
          ]}
          component={<Payment />}
        />
      }
    >
      <Route path="edit" element={<Edit />} />
      <Route path="documents" element={<Documents />} />
    </Route>
    <Route
      path=":id"
      element={<Guard guards={[admin()]} component={<Payment />} />}
    >
      <Route path="payment_fields" element={<PaymentFields />} />
    </Route>
  </Route>
);
