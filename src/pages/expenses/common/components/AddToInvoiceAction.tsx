/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Expense } from '$app/common/interfaces/expense';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdTextSnippet } from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { useInvoiceExpense } from '../useInvoiceExpense';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { route } from '$app/common/helpers/route';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '$app/components/Spinner';
import { styled } from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';

interface Props {
  expense: Expense;
}

const Div = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function AddToInvoiceAction(props: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const formatMoney = useFormatMoney();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const colors = useColorScheme();

  const queryClient = useQueryClient();

  const { calculatedTaxRate } = useInvoiceExpense();

  const { expense } = props;

  const setInvoice = useSetAtom(invoiceAtom);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visibleModal, setVisibleModal] = useState<boolean>(false);

  const handleAddToInvoice = (invoice: Invoice) => {
    setInvoice(
      () =>
        invoice && {
          ...invoice,
          line_items: [
            ...invoice.line_items,
            {
              ...blankLineItem(),
              type_id: InvoiceItemType.Product,
              cost: expense.amount,
              quantity: 1,
              product_key: expense?.category?.name ?? '',
              notes: expense.public_notes,
              line_total: Number((expense.amount * 1).toPrecision(2)),
              expense_id: expense.id,
              tax_name1: expense.tax_name1,
              tax_rate1: calculatedTaxRate(
                expense,
                expense.tax_amount1,
                expense.tax_rate1
              ),
              tax_name2: expense.tax_name2,
              tax_rate2: calculatedTaxRate(
                expense,
                expense.tax_amount2,
                expense.tax_rate2
              ),
              tax_name3: expense.tax_name3,
              tax_rate3: calculatedTaxRate(
                expense,
                expense.tax_amount3,
                expense.tax_rate3
              ),
            },
          ],
        }
    );

    navigate(
      route('/invoices/:id/edit?action=invoice_expense', {
        id: invoice.id,
      })
    );
  };

  useEffect(() => {
    if (visibleModal) {
      setIsLoading(true);

      queryClient
        .fetchQuery(
          [
            '/api/v1/invoices',
            `include=client&status_id=1,2,3&is_deleted=true&without_deleted_clients=true&client_id=${expense.client_id}`,
          ],
          () =>
            request(
              'GET',
              endpoint(
                '/api/v1/invoices?include=client.group_settings&status_id=1,2,3&is_deleted=true&without_deleted_clients=true&client_id=:clientId',
                { clientId: expense.client_id || '' }
              )
            ),
          { staleTime: Infinity }
        )
        .then((response: GenericSingleResourceResponse<Invoice[]>) => {
          if (hasPermission('edit_invoice')) {
            setInvoices(response.data.data);
          } else {
            setInvoices(
              response.data.data.filter((invoice) => entityAssigned(invoice))
            );
          }
        })
        .finally(() => setIsLoading(false));
    }

    if (!visibleModal) {
      setInvoices([]);
    }
  }, [visibleModal]);

  return (
    <>
      <Modal
        title={t('action_add_to_invoice')}
        onClose={() => setVisibleModal(false)}
        visible={visibleModal}
      >
        <div className="flex flex-col space-y-1">
          {invoices.map((invoice) => (
            <Div
              theme={{ hoverColor: colors.$5 }}
              key={invoice.id}
              onClick={() => handleAddToInvoice(invoice)}
              className="flex items-center justify-between cursor-pointer rounded py-1 px-2"
            >
              <p>{invoice?.number}</p>

              <p>
                {formatMoney(
                  invoice.amount,
                  invoice.client?.country_id,
                  invoice.client?.settings.currency_id
                )}
              </p>
            </Div>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}

        {!isLoading && !invoices.length && (
          <div className="flex justify-center font-medium text-lg">
            {t('no_invoices_found')}
          </div>
        )}
      </Modal>

      <DropdownElement
        onClick={() => setVisibleModal(true)}
        icon={<Icon element={MdTextSnippet} />}
      >
        {t('action_add_to_invoice')}
      </DropdownElement>
    </>
  );
}
