/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../components/cards';
import { Button, Checkbox, SelectField } from '../../../components/forms';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';
import {
  Pagination,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '../../../components/tables';

export function TaxSettings() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('tax_settings')}`;
  });

  return (
    <Settings title={t('tax_settings')}>
      <Card withSaveButton title={t('tax_settings')}>
        <Element leftSide={t('invoice_tax_rates')}>
          <SelectField>
            <option value="disabled">{t('disabled')}</option>
            <option value="one_tax_rate">{t('one_tax_rate')}</option>
            <option value="two_tax_rates">{t('two_tax_rates')}</option>
            <option value="three_tax_rates">{t('three_tax_rates')}</option>
          </SelectField>
        </Element>
        <Element leftSide={t('item_tax_rates')}>
          <SelectField>
            <option value="disabled">{t('disabled')}</option>
            <option value="one_tax_rate">{t('one_tax_rate')}</option>
            <option value="two_tax_rates">{t('two_tax_rates')}</option>
            <option value="three_tax_rates">{t('three_tax_rates')}</option>
          </SelectField>
        </Element>
        <Element
          leftSide={t('inclusive_taxes')}
          leftSideHelp={
            <span className="flex flex-col">
              <span>Exclusive: 100+10% = 100 + 10</span>
              <span>Inclusive: 100+10% = 90.91 + 9.09</span>
            </span>
          }
        >
          <Toggle />
        </Element>
      </Card>

      <div className="flex justify-end mt-8">
        <Button to="/tax_rates/create">{t('create_tax_rate')}</Button>
      </div>

      <Table>
        <Thead>
          <Th>{t('name')}</Th>
          <Th>{t('rate')}</Th>
          <Th>{t('type')}</Th>
          <Th>{t('action')}</Th>
        </Thead>
        <Tbody>
          <Tr>
            <Td colSpan={4}>{t('empty_table')}</Td>
          </Tr>
        </Tbody>
      </Table>

      <Pagination
        currentPage={1}
        onPageChange={() => {}}
        onRowsChange={() => {}}
        totalPages={1}
      />
    </Settings>
  );
}
