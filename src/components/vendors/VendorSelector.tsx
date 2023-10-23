/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';
import { Vendor } from '$app/common/interfaces/vendor';
import { CreateVendorModal } from '$app/pages/vendors/components/CreateVendorModal';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxAsync, Entry } from '../forms/Combobox';
import { endpoint } from '$app/common/helpers';

export interface VendorSelectorProps extends GenericSelectorProps<Vendor> {
  initiallyVisible?: boolean;
  setVisible?: Dispatch<SetStateAction<boolean>>;
  setSelectedIds?: Dispatch<SetStateAction<string[]>>;
  staleTime?: number;
}

export function VendorSelector(props: VendorSelectorProps) {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CreateVendorModal
        visible={props.initiallyVisible || isModalOpen}
        setVisible={props.setVisible || setIsModalOpen}
        setSelectedIds={props.setSelectedIds}
        onVendorCreated={(vendor) => props.onChange(vendor)}
      />

      {!props.setSelectedIds && (
        <ComboboxAsync<Vendor>
          endpoint={endpoint('/api/v1/vendors?status=active&per_page=500')}
          onChange={(vendor: Entry<Vendor>) =>
            vendor.resource && props.onChange(vendor.resource)
          }
          inputOptions={{
            label: props.inputLabel?.toString(),
            value: props.value || null,
          }}
          entryOptions={{
            id: 'id',
            label: 'name',
            value: 'id',
          }}
          action={{
            label: t('new_vendor'),
            onClick: () => setIsModalOpen(true),
            visible: true,
          }}
          readonly={props.readonly}
          onDismiss={props.onClearButtonClick}
          initiallyVisible={props.initiallyVisible}
          sortBy="name|asc"
          staleTime={props.staleTime || 500}
          errorMessage={props.errorMessage}
        />
      )}
    </>
  );
}
