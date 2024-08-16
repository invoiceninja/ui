/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { DataTable } from '$app/components/DataTable';
import { EntityStatus } from '$app/components/EntityStatus';
import { Inline } from '$app/components/Inline';
import { CustomDesignsPlanAlert } from '../components/CustomDesignsPlanAlert';

export default function CustomDesigns() {
  return (
    <>
      <CustomDesignsPlanAlert />

      <DataTable
        endpoint="/api/v1/designs?custom=true"
        columns={[
          {
            id: 'name',
            label: 'Name',
            format: (field, resource) => (
              <Inline>
                <EntityStatus entity={resource} />
                <p>{field}</p>
              </Inline>
            ),
          },
        ]}
        resource="design"
        linkToCreate="/settings/invoice_design/custom_designs/create"
        bulkRoute="/api/v1/designs/bulk"
        linkToEdit="/settings/invoice_design/custom_designs/:id/edit"
        withResourcefulActions
        hideEditableOptions={!proPlan() && !enterprisePlan()}
      />
    </>
  );
}
