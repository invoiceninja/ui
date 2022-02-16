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
import { Button, SelectField } from '../../../components/forms';
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

export function OnlinePayments() {
  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('online_payments'), href: '/settings/online_payments' },
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'online_payments'
    )}`;
  });

  return (
    <Settings
      title={t('online_payments')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#online_payments"
    >
      <Card withSaveButton title={t('settings')}>
        <Element leftSide={t('auto_bill_on')}>
          <SelectField>
            <option value="due_date">{t('due_date')}</option>
            <option value="send_date">{t('send_date')}</option>
          </SelectField>
        </Element>
        <Element leftSide={t('use_available_credits')}>
          <SelectField>
            <option value="enabled">{t('enabled')}</option>
            <option value="show_option">{t('show_option')}</option>
            <option value="off">{t('off')}</option>
          </SelectField>
        </Element>
        <Element leftSide={t('allow_over_payment')}>
          <Toggle
            label={t('allow_over_payment_help')}
            id="allow_over_payment"
          />
        </Element>
        <Element leftSide={t('allow_under_payment')}>
          <Toggle
            label={t('allow_under_payment_help')}
            id="allow_under_payment"
          />
        </Element>
      </Card>

      <div className="flex justify-end mt-8">
        <Button to="/gateways/create">{t('add_gateway')}</Button>
      </div>

      <Table>
        <Thead>
          <Th>{t('gateway')}</Th>
          <Th>{t('limits')}</Th>
          <Th>{t('fees')}</Th>
          <Th>{t('action')}</Th>
        </Thead>
        <Tbody>
          <Tr>
            <Td>PayPal Express</Td>
            <Td>No Limits</Td>
            <Td>Fees are disabled</Td>
            <Td></Td>
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
