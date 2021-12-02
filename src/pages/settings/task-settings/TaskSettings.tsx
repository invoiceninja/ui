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
import { Button, InputField } from '../../../components/forms';
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

export function TaskSettings() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('task_settings')}`;
  });

  return (
    <Settings title={t('task_settings')}>
      <Card title={t('settings')}>
        <Element leftSide={t('default_task_rate')}>
          <InputField id="default_task_rate" />
        </Element>
        <Element
          leftSide={t('auto_start_tasks')}
          leftSideHelp={t('auto_start_tasks_help')}
        >
          <Toggle />
        </Element>
        <Element
          leftSide={t('show_task_end_date')}
          leftSideHelp={t('show_task_end_date_help')}
        >
          <Toggle />
        </Element>

        <div className="pt-6 border-b"></div>

        <Element
          className="mt-6"
          leftSide={t('show_tasks_table')}
          leftSideHelp={t('show_tasks_table_help')}
        >
          <Toggle />
        </Element>
        <Element
          leftSide={t('invoice_task_datelog')}
          leftSideHelp={t('invoice_task_datelog_help')}
        >
          <Toggle />
        </Element>
        <Element
          leftSide={t('invoice_task_timelog')}
          leftSideHelp={t('invoice_task_timelog_help')}
        >
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
        <Button to="/task_settings/statuses/create">Create status</Button>
      </div>

      <Table>
        <Thead>
          <Th>{t('status')}</Th>
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
