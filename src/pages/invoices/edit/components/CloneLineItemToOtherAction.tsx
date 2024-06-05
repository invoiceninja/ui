/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button, InputLabel, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { InvoiceSelector } from '$app/components/invoices/InvoiceSelector';
import { creditAtom } from '$app/pages/credits/common/atoms';
import { quoteAtom } from '$app/pages/quotes/common/atoms';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdControlPointDuplicate } from 'react-icons/md';
import { invoiceAtom } from '../../common/atoms';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';
import { recurringInvoiceAtom } from '$app/pages/recurring-invoices/common/atoms';
import { v4 } from 'uuid';
import { Credit } from '$app/common/interfaces/credit';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Quote } from '$app/common/interfaces/quote';
import { CreditSelector } from '$app/components/credits/CreditSelector';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { QuoteSelector } from '$app/components/quotes/QuoteSelector';
import { RecurringInvoiceSelector } from '$app/components/recurring-invoices/RecurringInvoiceSelector';
import { PurchaseOrderSelector } from '$app/components/purchase-orders/PurchaseOrderSelector';

type SelectedEntity =
  | Invoice
  | Credit
  | PurchaseOrder
  | RecurringInvoice
  | Quote;

interface Props {
  entity:
    | 'invoice'
    | 'recurring_invoice'
    | 'credit'
    | 'purchase_order'
    | 'quote';
  lineItem: InvoiceItem;
}

export function CloneLineItemToOtherAction(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const { entity, lineItem } = props;

  const availableEntities = [
    'invoice',
    'recurring_invoice',
    'credit',
    'quote',
    'purchase_order',
  ];

  const setQuote = useSetAtom(quoteAtom);
  const setCredit = useSetAtom(creditAtom);
  const setInvoice = useSetAtom(invoiceAtom);
  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);
  const setRecurringInvoice = useSetAtom(recurringInvoiceAtom);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentEntity, setCurrentEntity] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>();

  const handleOnClose = () => {
    setCurrentEntity('');
    setIsModalOpen(false);
    setSelectedEntity(undefined);
  };

  const handleClone = () => {
    if (selectedEntity) {
      if (currentEntity === 'invoice') {
        setInvoice({
          ...(selectedEntity as Invoice),
          line_items: [
            ...selectedEntity.line_items,
            { ...lineItem, _id: v4() },
          ],
        });

        navigate(
          route('/invoices/:id/edit?action=clone_line_item', {
            id: selectedEntity.id,
          })
        );
      } else if (currentEntity === 'credit') {
        setCredit({
          ...(selectedEntity as Credit),
          line_items: [
            ...selectedEntity.line_items,
            { ...lineItem, _id: v4() },
          ],
        });

        navigate(
          route('/credits/:id/edit?action=clone_line_item', {
            id: selectedEntity.id,
          })
        );
      } else if (currentEntity === 'purchase_order') {
        setPurchaseOrder({
          ...(selectedEntity as PurchaseOrder),
          line_items: [
            ...selectedEntity.line_items,
            { ...lineItem, _id: v4() },
          ],
        });

        console.log({
          ...(selectedEntity as PurchaseOrder),
          line_items: [
            ...selectedEntity.line_items,
            { ...lineItem, _id: v4() },
          ],
        });

        navigate(
          route('/purchase_orders/:id/edit?action=clone_line_item', {
            id: selectedEntity.id,
          })
        );
      } else if (currentEntity === 'quote') {
        setQuote({
          ...(selectedEntity as Quote),
          line_items: [
            ...selectedEntity.line_items,
            { ...lineItem, _id: v4() },
          ],
        });

        navigate(
          route('/quotes/:id/edit?action=clone_line_item', {
            id: selectedEntity.id,
          })
        );
      } else if (currentEntity === 'recurring_invoice') {
        setRecurringInvoice({
          ...(selectedEntity as RecurringInvoice),
          line_items: [
            ...selectedEntity.line_items,
            { ...lineItem, _id: v4() },
          ],
        });

        navigate(
          route('/recurring_invoices/:id/edit?action=clone_line_item', {
            id: selectedEntity.id,
          })
        );
      }
    }
  };

  return (
    <>
      <DropdownElement
        icon={<Icon element={MdControlPointDuplicate} />}
        onClick={() => setIsModalOpen(true)}
      >
        {t('clone_to_other')}
      </DropdownElement>

      <Modal
        title={t('clone_to_other')}
        visible={isModalOpen}
        onClose={handleOnClose}
        overflowVisible
      >
        <SelectField
          label={t('entity')}
          value={currentEntity}
          onValueChange={(value) => {
            setCurrentEntity(value);
            setSelectedEntity(undefined);
          }}
          withBlank
        >
          {availableEntities
            .filter((currentEntity) => currentEntity !== entity)
            .map((entityName) => (
              <option key={entityName} value={entityName}>
                {t(entityName)}
              </option>
            ))}
        </SelectField>

        {currentEntity && (
          <div className="flex flex-col space-y-1">
            <InputLabel>{t('resource')}</InputLabel>

            {currentEntity === 'invoice' && (
              <InvoiceSelector
                value={selectedEntity?.id || ''}
                onChange={(invoice) => setSelectedEntity(invoice)}
              />
            )}

            {currentEntity === 'credit' && (
              <CreditSelector
                value={selectedEntity?.id || ''}
                onChange={(credit) => setSelectedEntity(credit)}
              />
            )}

            {currentEntity === 'quote' && (
              <QuoteSelector
                value={selectedEntity?.id || ''}
                onChange={(quote) => setSelectedEntity(quote)}
              />
            )}

            {currentEntity === 'recurring_invoice' && (
              <RecurringInvoiceSelector
                value={selectedEntity?.id || ''}
                onChange={(recurringInvoice) =>
                  setSelectedEntity(recurringInvoice)
                }
              />
            )}

            {currentEntity === 'purchase_order' && (
              <PurchaseOrderSelector
                value={selectedEntity?.id || ''}
                onChange={(purchaseOrder) => setSelectedEntity(purchaseOrder)}
              />
            )}
          </div>
        )}

        <Button
          behavior="button"
          onClick={handleClone}
          disableWithoutIcon
          disabled={!selectedEntity}
        >
          {t('clone')}
        </Button>
      </Modal>
    </>
  );
}
