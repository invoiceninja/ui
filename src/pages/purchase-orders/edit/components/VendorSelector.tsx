/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Checkbox, Link } from '$app/components/forms';
import { useVendorResolver } from '$app/common/hooks/vendors/useVendorResolver';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Vendor } from '$app/common/interfaces/vendor';
import { VendorSelector as Selector } from '$app/components/vendors/VendorSelector';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';

interface Props {
  resource?: PurchaseOrder;
  onChange: (id: string) => unknown;
  onClearButtonClick: () => unknown;
  onContactCheckboxChange: (id: string, checked: boolean) => unknown;
  readonly?: boolean;
  errorMessage?: string | string[];
  initiallyVisible?: boolean;
}

export function VendorSelector(props: Props) {
  const { t } = useTranslation();

  const { resource, initiallyVisible } = props;

  const hasPermission = useHasPermission();

  const vendorResolver = useVendorResolver();

  const [vendor, setVendor] = useState<Vendor>();
  const [vendorId, setVendorId] = useState<string>('');

  useEffect(() => {
    if (vendorId) {
      vendorResolver.find(vendorId).then((vendor) => setVendor(vendor));
    }
  }, [vendorId]);

  useEffect(() => {
    if (resource) {
      setVendorId(resource.vendor_id || resource.vendor?.id || '');
    }
  }, [resource?.vendor_id, resource?.vendor?.id]);

  const isChecked = (id: string) => {
    const potential = props.resource?.invitations.find(
      (i) => i.vendor_contact_id === id
    );

    return Boolean(potential);
  };

  return (
    <>
      <div className="flex flex-col justify-between space-y-2">
        {props.readonly ? (
          <p className="text-sm">{vendor?.name}</p>
        ) : (
          <Selector
            inputLabel={t('vendor')}
            onChange={(vendor) => props.onChange(vendor.id)}
            value={vendorId}
            readonly={props.readonly}
            onClearButtonClick={props.onClearButtonClick}
            initiallyVisible={initiallyVisible}
            errorMessage={props.errorMessage}
          />
        )}

        {vendor && (
          <div className="space-x-2">
            {hasPermission('edit_vendor') && (
              <Link to={route('/vendors/:id/edit', { id: vendor.id })}>
                {t('edit_vendor')}
              </Link>
            )}

            {hasPermission('edit_vendor') && <span className="text-sm">/</span>}

            {(hasPermission('view_vendor') || hasPermission('edit_vendor')) && (
              <Link to={route('/vendors/:id', { id: vendor.id })}>
                {t('view_vendor')}
              </Link>
            )}
          </div>
        )}
      </div>

      {vendorId &&
        vendor &&
        vendor.contacts.map((contact, index) => (
          <div key={index}>
            <Checkbox
              id={contact.id}
              value={contact.id}
              label={
                contact.first_name.length >= 1
                  ? `${contact.first_name} ${contact.last_name}`
                  : contact.email || vendor.name
              }
              checked={isChecked(contact.id)}
              onValueChange={(value, checked) =>
                props.onContactCheckboxChange(value, checked || false)
              }
            />

            {contact.first_name && (
              <span className="text-sm">{contact.email}</span>
            )}
          </div>
        ))}
    </>
  );
}
