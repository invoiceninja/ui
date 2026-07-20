/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import {
  useEntityTagFilterColumns,
  useTagFilterCleanup,
} from '$app/common/hooks/useEntityTagFilters';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { TAG_ENTITY_TYPES } from '$app/common/interfaces/tag';
import { useVendorQuery } from '$app/common/queries/vendor';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { ImportButton } from '$app/components/import/ImportButton';
import { Default } from '$app/components/layouts/Default';
import {
  VendorSlider,
  vendorSliderAtom,
  vendorSliderVisibilityAtom,
} from '../common/components/VendorSlider';
import {
  defaultColumns,
  useAllVendorColumns,
  useVendorColumns,
} from '../common/hooks';
import { useActions } from '../common/hooks/useActions';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';

export default function Vendors() {
  const { documentTitle } = useTitle('vendors');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();

  const pages: Page[] = [{ name: t('vendors'), href: '/vendors' }];

  const actions = useActions();
  const columns = useVendorColumns();
  const reactSettings = useReactSettings();
  const vendorColumns = useAllVendorColumns();
  const customBulkActions = useCustomBulkActions();

  const selectedColumns =
    reactSettings?.react_table_columns?.vendor || defaultColumns;
  const shouldShowTagFilter = selectedColumns.includes('tags');
  const filterColumns = useEntityTagFilterColumns(
    TAG_ENTITY_TYPES.vendor,
    'vendor_tag_ids',
    { enabled: shouldShowTagFilter }
  );

  useTagFilterCleanup(shouldShowTagFilter, 'vendor_tag_ids');

  const [sliderVendorId, setSliderVendorId] = useState<string>('');
  const [vendorSlider, setVendorSlider] = useAtom(vendorSliderAtom);
  const [vendorSliderVisibility, setVendorSliderVisibility] = useAtom(
    vendorSliderVisibilityAtom
  );

  const { data: vendorResponse } = useVendorQuery({
    id: sliderVendorId,
    enabled: Boolean(sliderVendorId),
  });

  useEffect(() => {
    if (sliderVendorId) {
      setVendorSlider(null);
    }
  }, [sliderVendorId]);

  useEffect(() => {
    if (vendorResponse && vendorSliderVisibility) {
      setVendorSlider(vendorResponse);
    }
  }, [vendorResponse, vendorSliderVisibility]);

  useEffect(() => {
    return () => setVendorSliderVisibility(false);
  }, []);

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <DataTable
        resource="vendor"
        columns={columns}
        endpoint={`/api/v1/vendors?sort=id|desc${
          shouldShowTagFilter ? '&include=tags' : '&tag_ids='
        }`}
        bulkRoute="/api/v1/vendors/bulk"
        linkToCreate="/vendors/create"
        linkToEdit="/vendors/:id/edit"
        withResourcefulActions
        customActions={actions}
        customBulkActions={customBulkActions}
        filterColumns={shouldShowTagFilter ? filterColumns : undefined}
        rightSide={
          <div className="flex items-center space-x-2">
            <DataTableColumnsPicker
              columns={vendorColumns as unknown as string[]}
              defaultColumns={defaultColumns}
              table="vendor"
            />

            <Guard
              type="component"
              guards={[
                or(permission('create_vendor'), permission('edit_vendor')),
              ]}
              component={<ImportButton route="/vendors/import" />}
            />
          </div>
        }
        linkToCreateGuards={[permission('create_vendor')]}
        hideEditableOptions={!hasPermission('edit_vendor')}
        onTableRowClick={(vendor) => {
          setSliderVendorId(vendor.id);
          setVendorSliderVisibility(true);
        }}
        enableSavingFilterPreference
        dateRangeColumns={[
          { column: 'created_at', queryParameterKey: 'created_between' },
        ]}
        enableSavingLatestDataForNavigation
      />

      {!disableNavigation('vendor', vendorSlider) && <VendorSlider />}
    </Default>
  );
}
