/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EntityState } from '$app/common/enums/entity-state';
import { endpoint, getEntityState } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { useBulk } from '$app/common/queries/company-gateways';
import { Divider } from '$app/components/cards/Divider';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdArchive, MdDelete, MdFileUpload, MdRestore } from 'react-icons/md';

export function useActions() {
  const [t] = useTranslation();

  const bulk = useBulk();

  const handleImportCustomers = (companyGatewayId: string) => {
    toast.processing();

    request(
      'POST',
      endpoint('/api/v1/company_gateways/:id/import_customers', {
        id: companyGatewayId,
      })
    ).then((response) => toast.success(response.data.message));
  };

  const actions: Action<CompanyGateway>[] = [
    (companyGateway) => (
      <DropdownElement
        onClick={() => handleImportCustomers(companyGateway.id)}
        icon={<Icon element={MdFileUpload} />}
      >
        {t('import_customers')}
      </DropdownElement>
    ),
    () => <Divider withoutPadding />,
    (companyGateway) =>
      getEntityState(companyGateway) === EntityState.Active && (
        <DropdownElement
          onClick={() => bulk([companyGateway.id], 'archive')}
          icon={<Icon element={MdArchive} />}
        >
          {t('archive')}
        </DropdownElement>
      ),
    (companyGateway) =>
      (getEntityState(companyGateway) === EntityState.Archived ||
        getEntityState(companyGateway) === EntityState.Deleted) && (
        <DropdownElement
          onClick={() => bulk([companyGateway.id], 'restore')}
          icon={<Icon element={MdRestore} />}
        >
          {t('restore')}
        </DropdownElement>
      ),
    (companyGateway) =>
      (getEntityState(companyGateway) === EntityState.Active ||
        getEntityState(companyGateway) === EntityState.Archived) && (
        <DropdownElement
          onClick={() => bulk([companyGateway.id], 'delete')}
          icon={<Icon element={MdDelete} />}
        >
          {t('delete')}
        </DropdownElement>
      ),
  ];

  return actions;
}
