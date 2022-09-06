/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { Checkbox } from '@invoiceninja/forms';
import { useVendorResolver } from 'common/hooks/vendors/useVendorResolver';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { Vendor } from 'common/interfaces/vendor';
import { VendorSelector as Selector } from 'components/vendors/VendorSelector';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  resource?: PurchaseOrder;
  onChange: (id: string) => unknown;
  onClearButtonClick: () => unknown;
  onContactCheckboxChange: (id: string, checked: boolean) => unknown;
  readonly?: boolean;
  errorMessage?: string | string[];
}

export function VendorSelector(props: Props) {
  const { t } = useTranslation();
  const [vendor, setVendor] = useState<Vendor>();

  const vendorResolver = useVendorResolver();

  useEffect(() => {
    if (props.resource && props.resource.vendor_id.length > 0) {
      vendorResolver
        .find(props.resource.vendor_id)
        .then((vendor) => setVendor(vendor));
    }
  }, [props.resource?.vendor_id]);

  const isChecked = (id: string) => {
    const potential = props.resource?.invitations.find(
      (i) => i.vendor_contact_id === id
    );

    return Boolean(potential);
  };

  return (
    <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
      <div className="flex items-center justify-between">
        <Selector
          inputLabel={t('vendor')}
          onChange={(vendor) => props.onChange(vendor.id)}
          value={props.resource?.vendor_id}
          readonly={props.readonly}
          clearButton={Boolean(props.resource?.vendor_id)}
          onClearButtonClick={props.onClearButtonClick}
          errorMessage={props.errorMessage}
        />
      </div>

      {props.resource?.vendor_id &&
        vendor &&
        vendor.contacts.map((contact, index) => (
          <div key={index}>
            <Checkbox
              id={contact.id}
              value={contact.id}
              label={
                contact.first_name.length >= 1
                  ? `${contact.first_name} ${contact.last_name}`
                  : t('blank_contact')
              }
              checked={isChecked(contact.id)}
              onValueChange={(value, checked) =>
                props.onContactCheckboxChange(value, checked || false)
              }
            />

            <span className="text-sm text-gray-700">{contact.email}</span>
          </div>
        ))}
    </Card>
  );
}
