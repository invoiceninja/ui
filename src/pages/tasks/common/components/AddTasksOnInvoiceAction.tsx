/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from '$app/common/helpers';
import { Task } from '$app/common/interfaces/task';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useState } from 'react';
import { MdAddCircleOutline } from 'react-icons/md';
import { AddTasksOnInvoiceModal } from './AddTasksOnInvoiceModal';
import { toast } from '$app/common/helpers/toast/toast';

interface Props {
  tasks: Task[];
  isBulkAction?: boolean;
}

export function AddTasksOnInvoiceAction(props: Props) {
  const { tasks, isBulkAction } = props;

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const handleOpenModal = () => {
    if (!tasks.length) {
      return toast.error('no_invoices_found');
    }

    const clientIdsOfSelectedTasks = tasks.map((task) => task.client_id);

    if (clientIdsOfSelectedTasks.length) {
      const clientId = clientIdsOfSelectedTasks[0];

      const isAnyClientDifferent = clientIdsOfSelectedTasks.some(
        (id) => id !== clientId
      );

      if (isAnyClientDifferent) {
        return toast.error('multiple_client_error');
      }
    }

    setIsModalVisible(true);
  };

  return (tasks[0].client_id && !tasks[0].invoice_id) || isBulkAction ? (
    <>
      <AddTasksOnInvoiceModal
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        clientId={tasks[0].client_id}
        tasks={tasks}
      />

      <DropdownElement
        onClick={() => handleOpenModal()}
        icon={<Icon element={MdAddCircleOutline} />}
      >
        {trans('add_to_invoice', { invoice: '' })}
      </DropdownElement>
    </>
  ) : (
    <></>
  );
}
