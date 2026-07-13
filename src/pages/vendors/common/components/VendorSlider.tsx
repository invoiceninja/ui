/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Slider } from '$app/components/cards/Slider';
import { TabGroup } from '$app/components/TabGroup';
import { Element } from '$app/components/cards';
import { endpoint } from '$app/common/helpers';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Upload } from '$app/pages/settings/company/documents/components';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useColorScheme } from '$app/common/colors';
import { ResourceActions } from '$app/components/ResourceActions';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Divider } from '$app/components/cards/Divider';
import { Icon } from '$app/components/icons/Icon';
import { MdEdit } from 'react-icons/md';
import { route } from '$app/common/helpers/route';
import { Vendor } from '$app/common/interfaces/vendor';
import { useActions } from '../hooks/useActions';

export const vendorSliderAtom = atom<Vendor | null>(null);
export const vendorSliderVisibilityAtom = atom(false);

export function VendorSlider() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const actions = useActions();
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const [vendor, setVendor] = useAtom(vendorSliderAtom);
  const [isVisible, setIsSliderVisible] = useAtom(vendorSliderVisibilityAtom);

  return (
    <Slider
      size="regular"
      visible={isVisible}
      onClose={() => {
        setIsSliderVisible(false);
        setVendor(null);
      }}
      title={`${t('vendor')} ${vendor?.name || ''}`}
      topRight={
        vendor && (hasPermission('edit_vendor') || entityAssigned(vendor)) ? (
          <ResourceActions
            label={t('actions')}
            resource={vendor}
            actions={[
              (resource: Vendor) => (
                <DropdownElement
                  to={route('/vendors/:id/edit', { id: resource.id })}
                  icon={<Icon element={MdEdit} />}
                >
                  {t('edit')}
                </DropdownElement>
              ),
              () => <Divider withoutPadding />,
              ...actions,
            ]}
          />
        ) : null
      }
      withoutActionContainer
      withoutHeaderBorder
    >
      <TabGroup
        tabs={[t('overview'), t('documents')]}
        width="full"
        formatTabLabel={(tabIndex) => {
          if (tabIndex === 1) {
            return (
              <DocumentsTabLabel
                numberOfDocuments={vendor?.documents?.length}
                textCenter
              />
            );
          }
        }}
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
      >
        <div className="space-y-2">
          <div className="px-6">
            <Element
              className="border-b border-dashed"
              leftSide={t('number')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {vendor?.number}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('id_number')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {vendor?.id_number}
            </Element>

            <Element
              className="border-b border-dashed"
              leftSide={t('vat_number')}
              pushContentToRight
              withoutWrappingLeftSide
              noExternalPadding
              style={{ borderColor: colors.$20 }}
            >
              {vendor?.vat_number}
            </Element>

            <Element leftSide={t('phone')} pushContentToRight noExternalPadding>
              {vendor?.phone}
            </Element>
          </div>
        </div>

        <div className="px-4">
          <Upload
            endpoint={endpoint('/api/v1/vendors/:id/upload', {
              id: vendor?.id,
            })}
            onSuccess={() => $refetch(['vendors'])}
            widgetOnly
            disableUpload={
              !hasPermission('edit_vendor') && !entityAssigned(vendor)
            }
          />

          <DocumentsTable
            documents={vendor?.documents || []}
            onDocumentDelete={() => $refetch(['vendors'])}
            disableEditableOptions={
              !entityAssigned(vendor, true) && !hasPermission('edit_vendor')
            }
          />
        </div>
      </TabGroup>
    </Slider>
  );
}
