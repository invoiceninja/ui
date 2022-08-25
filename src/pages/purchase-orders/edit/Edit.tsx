/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Invitation, PurchaseOrder } from 'common/interfaces/purchase-order';
import { usePurchaseOrderQuery } from 'common/queries/purchase-orders';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { VendorSelector } from './components/VendorSelector';

export function Edit() {
  const { documentTitle } = useTitle('edit_purchase_order');
  const { t } = useTranslation();
  const { id } = useParams();
  const { data } = usePurchaseOrderQuery({ id });

  const pages: BreadcrumRecord[] = [
    { name: t('purchase_orders'), href: '/purchase_orders' },
    {
      name: t('edit_purchase_order'),
      href: generatePath('/purchase_orders/:id/edit', { id }),
    },
  ];

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>();

  useEffect(() => {
    data && setPurchaseOrder(data);
  }, [data]);

  const handleChange = <T extends keyof PurchaseOrder>(
    property: T,
    value: PurchaseOrder[typeof property]
  ) => {
    setPurchaseOrder((current) => current && { ...current, [property]: value });
  };

  const handleInvitationChange = (id: string, checked: boolean) => {
    let invitations = [...purchaseOrder!.invitations];

    const potential =
      invitations?.find((invitation) => invitation.vendor_contact_id === id) ||
      -1;

    if (potential !== -1 && checked === false) {
      invitations = invitations.filter((i) => i.vendor_contact_id !== id);
    }

    if (potential === -1) {
      const invitation: Partial<Invitation> = {
        vendor_contact_id: '',
      };

      invitation.vendor_contact_id = id;

      invitations.push(invitation as Invitation);
    }

    handleChange('invitations', invitations);
  };

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-4">
        <VendorSelector
          readonly
          resource={purchaseOrder}
          onChange={(id) => handleChange('vendor_id', id)}
          onClearButtonClick={() => handleChange('vendor_id', '')}
          onContactCheckboxChange={handleInvitationChange}
        />
      </div>
    </Default>
  );
}
