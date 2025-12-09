/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { DataTable } from '$app/components/DataTable';
import { EntityStatus } from '$app/components/EntityStatus';
import { Inline } from '$app/components/Inline';
import { Button } from '$app/components/forms';
import { Paintbrush, Plus } from 'lucide-react';
import { route } from '$app/common/helpers/route';
import { Design } from '$app/common/interfaces/design';

// Visual builder metadata marker
const VISUAL_BUILDER_MARKER = '<!-- VISUAL_BUILDER_BLOCKS:';

/**
 * Check if a design was created with the visual builder
 */
function isVisualBuilderDesign(design: Design): boolean {
  return design.design?.includes?.includes(VISUAL_BUILDER_MARKER) ?? false;
}

export default function CustomDesigns() {
  const navigate = useNavigate();
  const [t] = useTranslation();

  return (
    <>
      <AdvancedSettingsPlanAlert />

      {/* Create buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          type="secondary"
          behavior="button"
          onClick={() => navigate(route('/settings/invoice_design/custom_designs/create'))}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('new_design')}
        </Button>
        <Button
          type="primary"
          behavior="button"
          onClick={() => navigate(route('/settings/invoice_design/builder/new'))}
          className="flex items-center gap-2"
        >
          <Paintbrush className="w-4 h-4" />
          {t('visual_builder')}
        </Button>
      </div>

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
                {isVisualBuilderDesign(resource) && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                    Visual
                  </span>
                )}
              </Inline>
            ),
          },
          {
            id: 'actions',
            label: '',
            format: (_, resource: Design) => (
              <div className="flex justify-end">
                {isVisualBuilderDesign(resource) && (
                  <Button
                    type="minimal"
                    behavior="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(route('/settings/invoice_design/builder/:id', { id: resource.id }));
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Paintbrush className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        resource="design"
        bulkRoute="/api/v1/designs/bulk"
        linkToEdit="/settings/invoice_design/custom_designs/:id/edit"
        withResourcefulActions
        hideEditableOptions={!proPlan() && !enterprisePlan()}
        enableSavingFilterPreference
      />
    </>
  );
}
