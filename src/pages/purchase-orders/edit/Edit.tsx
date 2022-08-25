/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { Invitation, PurchaseOrder } from 'common/interfaces/purchase-order';
import { usePurchaseOrderQuery } from 'common/queries/purchase-orders';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Inline } from 'components/Inline';
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

        <Card className="col-span-12 xl:col-span-4 h-max">
          <Element leftSide={t('purchase_order_date')}>
            <InputField
              type="date"
              value={purchaseOrder?.date}
              onValueChange={(date) => handleChange('date', date)}
            />
          </Element>

          <Element leftSide={t('due_date')}>
            <InputField
              type="date"
              value={purchaseOrder?.due_date}
              onValueChange={(date) => handleChange('due_date', date)}
            />
          </Element>

          <Element leftSide={t('partial')}>
            <InputField
              value={purchaseOrder?.partial}
              onValueChange={(partial) =>
                handleChange('partial', parseFloat(partial) || 0)
              }
            />
          </Element>

          {purchaseOrder && purchaseOrder.partial > 0 && (
            <Element leftSide={t('partial_due_date')}>
              <InputField
                type="date"
                value={purchaseOrder.partial_due_date}
                onValueChange={(date) => handleChange('partial_due_date', date)}
              />
            </Element>
          )}
        </Card>

        <Card className="col-span-12 xl:col-span-4 h-max">
          <Element leftSide={t('po_number')}>
            <InputField
              value={purchaseOrder?.number}
              onValueChange={(value) => handleChange('number', value)}
            />
          </Element>

          <Element leftSide={t('discount')}>
            <Inline>
              <div className="w-full lg:w-1/2">
                <InputField
                  value={purchaseOrder?.discount}
                  onValueChange={(value) =>
                    handleChange('discount', parseFloat(value) || 0)
                  }
                />
              </div>

              <div className="w-full lg:w-1/2">
                <SelectField
                  value={purchaseOrder?.is_amount_discount.toString()}
                  onValueChange={(value) =>
                    handleChange('is_amount_discount', JSON.parse(value))
                  }
                >
                  <option value="false">{t('percent')}</option>
                  <option value="true">{t('amount')}</option>
                </SelectField>
              </div>
            </Inline>
          </Element>
        </Card>
      </div>
    </Default>
  );
}
