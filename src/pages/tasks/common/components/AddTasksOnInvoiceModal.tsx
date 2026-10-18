/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { trans } from '$app/common/helpers';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Invoice } from '$app/common/interfaces/invoice';
import { Task } from '$app/common/interfaces/task';
import { Modal } from '$app/components/Modal';
import { useAddTasksOnInvoice } from '../hooks/useAddTasksOnInvoice';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  tasks: Task[];
  invoices: Invoice[];
}

const Div = styled.div`
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

export function AddTasksOnInvoiceModal(props: Props) {
  const { visible, setVisible, tasks, invoices } = props;

  const colors = useColorScheme();
  const formatMoney = useFormatMoney();

  const addTasksOnInvoice = useAddTasksOnInvoice({ tasks });

  return (
    <Modal
      title={trans('add_to_invoice', { invoice: '' })}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <div className="flex flex-col overflow-y-auto max-h-96">
        {invoices?.map((invoice, index) => (
          <Div
            key={index}
            className="flex justify-between py-2 cursor-pointer px-3"
            onClick={() => addTasksOnInvoice(invoice)}
            theme={{ hoverColor: colors.$5 }}
          >
            <span>{invoice.number}</span>

            <span>
              {formatMoney(
                invoice.amount,
                invoice.client?.country_id,
                invoice.client?.settings.currency_id
              )}
            </span>
          </Div>
        ))}
      </div>
    </Modal>
  );
}
