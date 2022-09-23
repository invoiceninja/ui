/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Button, Link } from '@invoiceninja/forms';
import {
  Pagination,
  Table as TableComponent,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@invoiceninja/tables';
import { AxiosError } from 'axios';
import { TaxRate } from 'common/interfaces/tax-rate';
import { bulk, useTaxRatesQuery } from 'common/queries/tax-rates';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';

export function TaxRates() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');

  const sort = 'id|asc';

  const { data } = useTaxRatesQuery({
    currentPage,
    perPage,
    sort,
  });

  const archive = (id: string) => {
    toast.loading(t('processing'));

    bulk([id], 'archive')
      .then(() => {
        toast.dismiss();
        toast.success(t('archived_tax_rate'));
      })
      .catch((error: AxiosError) => {
        toast.dismiss();
        toast.success(t('error_title'));

        console.error(error);
      })
      .finally(() => queryClient.invalidateQueries('/api/v1/tax_rates'));
  };

  return (
    <>
      <div className="flex justify-end mt-8">
        <Button to="/settings/tax_rates/create">{t('create_tax_rate')}</Button>
      </div>

      <TableComponent>
        <Thead>
          <Th>{t('name')}</Th>
          <Th>{t('rate')}</Th>
          <Th></Th>
        </Thead>
        <Tbody data={data} showHelperPlaceholders>
          {data &&
            data.data.data.map((taxRate: TaxRate) => (
              <Tr key={taxRate.id}>
                <Td>
                  <Link
                    to={route('/settings/tax_rates/:id/edit', {
                      id: taxRate.id,
                    })}
                  >
                    {taxRate.name}
                  </Link>
                </Td>
                <Td>{taxRate.rate}</Td>
                <Td>
                  <Dropdown label={t('actions')}>
                    <DropdownElement
                      to={route('/settings/tax_rates/:id/edit', {
                        id: taxRate.id,
                      })}
                    >
                      {t('edit_tax_rate')}
                    </DropdownElement>
                    <DropdownElement onClick={() => archive(taxRate.id)}>
                      {t('archive_tax_rate')}
                    </DropdownElement>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </TableComponent>

      {data && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowsChange={setPerPage}
          totalPages={data.data.meta.pagination.total_pages}
        />
      )}
    </>
  );
}
