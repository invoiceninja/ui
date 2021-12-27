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
import { Button } from '../../../components/forms';
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

export function ExpenseSettings() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'expense_settings'
    )}`;
  });

  return (
    <Settings title={t('expense_settings')}>
      <Card title={t('settings')}>
        <Element
          leftSide={t('should_be_invoiced')}
          leftSideHelp={t('should_be_invoiced_help')}
        >
          <Toggle />
        </Element>
        <Element leftSide={t('mark_paid')} leftSideHelp={t('mark_paid_help')}>
          <Toggle />
        </Element>
        <Element
          leftSide={t('add_documents_to_invoice')}
          leftSideHelp={t('add_documents_to_invoice_help')}
        >
          <Toggle />
        </Element>
      </Card>

      <div className="flex justify-end mt-8">
        <Button to="/expenses/categories/create">Create category</Button>
      </div>

      <Table>
        <Thead>
          <Th>{t('category')}</Th>
          <Th>{t('total')}</Th>
          <Th>{t('action')}</Th>
        </Thead>
        <Tbody>
          <Tr>
            <Td colSpan={3}>{t('empty_table')}</Td>
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
