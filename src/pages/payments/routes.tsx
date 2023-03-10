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
import { Apply } from './apply/Apply';
import { Create } from './create/Create';
import { Documents } from './documents/Documents';
import { Edit } from './edit/Edit';
import { PaymentFields } from './edit/PaymentFields';
import { Payments } from './index/Payments';
import { Payment } from './Payment';
import { Refund } from './refund/Refund';

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
      <Route path="documents" element={<Documents />} />
      <Route path="payment_fields" element={<PaymentFields />} />
      <Route path="apply" element={<Apply />} />
      <Route path="refund" element={<Refund />} />
    </Route>
    <Route path=":id/edit" element={<Payment />}>
      <Route
        path=""
        element={
          <Guard
            guards={[
              or(
                permission('edit_payment'),
                permission('view_payment'),
                assigned('/api/v1/payments/:id')
              ),
            ]}
            component={<Edit />}
          />
        }
      />
    </Route>
  </Route>
);
