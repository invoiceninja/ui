import { useBulkAction } from '../queries';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { BankAccount } from '$app/common/interfaces/bank-accounts';
import { Icon } from '$app/components/icons/Icon';
import { MdArchive, MdDelete, MdRestore } from 'react-icons/md';
import { getEntityState } from '$app/common/helpers';
import { EntityState } from '$app/common/enums/entity-state';

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulkAction();

  const actions = [
    (bankIntegration: BankAccount) =>
      getEntityState(bankIntegration) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk(bankIntegration.id, 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (bankIntegration: BankAccount) =>
      (getEntityState(bankIntegration) === EntityState.Archived ||
        getEntityState(bankIntegration) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk(bankIntegration.id, 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (bankIntegration: BankAccount) =>
      (getEntityState(bankIntegration) === EntityState.Active ||
        getEntityState(bankIntegration) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk(bankIntegration.id, 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
