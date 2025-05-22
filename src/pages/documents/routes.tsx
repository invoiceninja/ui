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
import { permission } from '$app/common/guards/guards/permission';
import { Route } from 'react-router-dom';
import { enabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '$app/pages/settings/account-management/component';
import { or } from '$app/common/guards/guards/or';
import { assigned } from '$app/common/guards/guards/assigned';
import { lazy } from 'react';
import { isHosted } from '$app/common/helpers';

const Documents = lazy(() => import('$app/pages/documents/index/Documents'));

export const documentsRoutes = (
    <Route path="/documents">
        <Route
            path=""
            element={
                <Guard
                    guards={[]}
                    // guards={[
                    //     true, //isHosted(),
                    //     or(
                    //         permission('view_invoice'),
                    //         permission('create_invoice'),
                    //         permission('edit_invoice')
                    //     ),
                    // ]}
                    component={<Documents />}
                />
            }
        />
        
    </Route>
);
