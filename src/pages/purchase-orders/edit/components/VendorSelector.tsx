/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Checkbox, InputLabel, Link } from '$app/components/forms';
import { useVendorResolver } from '$app/common/hooks/vendors/useVendorResolver';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Vendor } from '$app/common/interfaces/vendor';
import { VendorSelector as Selector } from '$app/components/vendors/VendorSelector';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useColorScheme } from '$app/common/colors';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import classNames from 'classnames';

interface Props {
  resource?: PurchaseOrder;
  onChange: (id: string) => unknown;
  onClearButtonClick: () => unknown;
  onContactCheckboxChange: (id: string, checked: boolean) => unknown;
  readonly?: boolean;
  errorMessage?: string | string[];
  initiallyVisible?: boolean;
  textOnly?: boolean;
  disableWithSpinner?: boolean;
}

export function VendorSelector(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const reactSettings = useReactSettings();
  const hasPermission = useHasPermission();

  const { resource, initiallyVisible } = props;

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
    <div className="flex flex-col space-y-4">
      <div
        className="flex flex-col justify-between space-y-0.5"
        style={{ color: colors.$3 }}
      >
        {props.textOnly ? (
          <div className="flex space-x-10">
            <span className="text-sm font-medium" style={{ color: colors.$22 }}>
              {t('vendor')}
            </span>

            <span className="text-sm font-medium">
              {resource?.vendor?.name}
            </span>
          </div>
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
              <Link
                className="font-medium"
                to={route('/vendors/:id/edit', { id: vendor.id })}
              >
                {t('edit')}
              </Link>
            )}

            {hasPermission('edit_vendor') && (
              <span className="text-sm" style={{ color: colors.$21 }}>
                |
              </span>
            )}

            {(hasPermission('view_vendor') || hasPermission('edit_vendor')) && (
              <Link
                className="font-medium"
                to={route('/vendors/:id', { id: vendor.id })}
              >
                {t('view')}
              </Link>
            )}
          </div>
        )}
      </div>

      {vendorId && vendor && vendor.contacts.length > 0 && (
        <div>
          <InputLabel className="mb-2.5">{t('contacts')}</InputLabel>

          <div
            className={classNames('divide-y divide-dashed', {
              'divide-[#09090B1A]': !reactSettings.dark_mode,
              'divide-[#1f2e41]': reactSettings.dark_mode,
            })}
          >
            {vendor.contacts.map((contact, index) => (
              <div
                key={index}
                className="flex justify-between items-center first:pt-0 pt-2 pb-2"
              >
                <div className="flex flex-col w-full">
                  <div className="flex space-x-2.5 w-full">
                    <Checkbox
                      id={contact.id}
                      value={contact.id}
                      checked={isChecked(contact.id)}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        props.onContactCheckboxChange(
                          event.target.value,
                          event.target.checked
                        )
                      }
                    />

                    <div className="flex flex-col truncate">
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.$3 }}
                      >
                        {contact.first_name.length >= 1
                          ? `${contact.first_name} ${contact.last_name}`
                          : contact.email || vendor.name}
                      </span>

                      {contact.first_name && (
                        <span className="text-sm" style={{ color: colors.$22 }}>
                          {contact.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
