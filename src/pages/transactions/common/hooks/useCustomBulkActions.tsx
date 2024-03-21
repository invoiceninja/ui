/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { TransactionStatus } from '$app/common/enums/transactions';
import { Transaction } from '$app/common/interfaces/transactions';
import { useBulk } from '$app/common/queries/transactions';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdLinkOff, MdOutlineContentCopy } from 'react-icons/md';
import { CreateExpenseBulkAction } from '../../components/CreateExpenseBulkAction';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const bulk = useBulk();

  const showConvertAction = (selectedTransactions: Transaction[]) => {
    return selectedTransactions.every(
      ({ status_id }) => TransactionStatus.Matched === status_id
    );
  };

  const showUnlinkAction = (selectedTransactions: Transaction[]) => {
    return selectedTransactions.every(({ payment_id }) => payment_id);
  };

  const customBulkActions: CustomBulkAction<Transaction>[] = [
    ({ selectedIds, selectedResources, setSelected }) =>
      selectedResources &&
      showUnlinkAction(selectedResources) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'unlink');
            setSelected([]);
          }}
          icon={<Icon element={MdLinkOff} />}
        >
          {t('unlink')}
        </DropdownElement>
      ),
    ({ selectedResources, setSelected }) =>
      selectedResources && (
        <CreateExpenseBulkAction
          setSelected={setSelected}
          transactions={selectedResources}
        />
      ),
    ({ selectedIds, selectedResources, setSelected }) =>
      selectedResources &&
      showConvertAction(selectedResources) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'convert_matched');
            setSelected([]);
          }}
          icon={<Icon element={MdOutlineContentCopy} />}
        >
          {t('convert')}
        </DropdownElement>
      ),
  ];

  return customBulkActions;
};
