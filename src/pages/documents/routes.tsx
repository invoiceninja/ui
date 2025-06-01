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
import { Route } from 'react-router-dom';
import { lazy } from 'react';

const Documents = lazy(() => import('$app/pages/documents/index/Documents'));

export const documentsRoutes = (
    <Route path="/documents">
        <Route
            path=""
            element={
                <Guard
                    guards={[]}
                    component={<Documents />}
                />
            }
        />
        
    </Route>
);
