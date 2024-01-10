/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, trans } from '$app/common/helpers';
import { Task } from '$app/common/interfaces/task';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useEffect, useState } from 'react';
import { MdAddCircleOutline } from 'react-icons/md';
import { AddTasksOnInvoiceModal } from './AddTasksOnInvoiceModal';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { useQueryClient } from 'react-query';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';

interface Props {
  tasks: Task[];
  isBulkAction?: boolean;
  setSelected?: (selected: string[]) => void;
}

export function AddTasksOnInvoiceAction(props: Props) {
  const { tasks, isBulkAction, setSelected } = props;

  const queryClient = useQueryClient();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const handleOpenModal = () => {
    if (!tasks.length) {
      return toast.error('no_invoices_found');
    }

    const clientIdsOfSelectedTasks = tasks.map((task) => task.client_id);

    const isAnyClientEmpty = clientIdsOfSelectedTasks.some((id) => !id);

    if (isAnyClientEmpty) {
      return toast.error('no_invoices_found');
    }

    if (clientIdsOfSelectedTasks.length) {
      const clientId = clientIdsOfSelectedTasks[0];

      const isAnyClientDifferent = clientIdsOfSelectedTasks.some(
        (id) => id !== clientId
      );

      if (isAnyClientDifferent) {
        return toast.error('multiple_client_error');
      }
    }

    toast.processing();

    queryClient
      .fetchQuery(
        ['/api/v1/invoices', 'client_id', tasks[0].client_id],
        () =>
          request(
            'GET',
            endpoint(
              '/api/v1/invoices?client_id=:clientId&include=client&status=active&per_page=100',
              {
                clientId: tasks[0].client_id,
              }
            )
          ),
        { staleTime: Infinity }
      )
      .then((response: GenericSingleResourceResponse<Invoice[]>) => {
        toast.dismiss();

        if (!response.data.data.length) {
          return toast.error('no_invoices_found');
        }

        if (hasPermission('edit_invoice')) {
          setInvoices(response.data.data);
        } else {
          setInvoices(
            response.data.data.filter((invoice) => entityAssigned(invoice))
          );
        }

        setIsModalVisible(true);
      });
  };

  useEffect(() => {
    !isModalVisible && setSelected?.([]);
  }, [isModalVisible]);

  return ((tasks.length && tasks[0].client_id && !tasks[0].invoice_id) ||
    isBulkAction) &&
    (hasPermission('create_invoice') || hasPermission('edit_invoice')) ? (
    <>
      <AddTasksOnInvoiceModal
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        tasks={tasks}
        invoices={invoices}
      />

      <DropdownElement
        onClick={handleOpenModal}
        icon={<Icon element={MdAddCircleOutline} />}
      >
        {trans('add_to_invoice', { invoice: '' })}
      </DropdownElement>
    </>
  ) : (
    <></>
  );
}
