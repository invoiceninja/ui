/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { MdEdit } from 'react-icons/md';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { Design } from '$app/common/interfaces/design';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { DataTable } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { EntityStatus } from '$app/components/EntityStatus';
import { Inline } from '$app/components/Inline';
import { Icon } from '$app/components/icons/Icon';
import {
  getDesignEditRoute,
  isVisualBuilderDesign,
} from '$app/pages/settings/invoice-design/common/helpers/design-editor';

export default function CustomDesigns() {
  const [t] = useTranslation();

  return (
    <>
      <AdvancedSettingsPlanAlert />

      <DataTable
        endpoint="/api/v1/designs?custom=true"
        columns={[
          {
            id: 'name',
            label: 'Name',
            format: (field, resource: Design) => (
              <Inline>
                <EntityStatus entity={resource} />
                <p>{field}</p>
                {isVisualBuilderDesign(resource) ? (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                    Visual
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    {t('legacy_design', { defaultValue: 'Legacy Design' })}
                  </span>
                )}
              </Inline>
            ),
          },
          {
            id: 'actions',
            label: '',
            format: (_, resource: Design) => null,
          },
        ]}
        resource="design"
        bulkRoute="/api/v1/designs/bulk"
        withResourcefulActions
        hideEditableOptions={!proPlan() && !enterprisePlan()}
        enableSavingFilterPreference
        customActions={[
          (resource: Design) => (
            <DropdownElement
              key="edit"
              to={getDesignEditRoute(resource)}
              icon={<Icon element={MdEdit} />}
            >
              {t('edit')}
            </DropdownElement>
          ),
        ]}
      />
    </>
  );
}
