/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import {
  Pagination,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@invoiceninja/tables';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import Toggle from 'components/forms/Toggle';
import { Settings } from 'components/layouts/Settings';
import { useTranslation } from 'react-i18next';
import { Button, SelectField } from '../../../components/forms';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import {
  useHandleCurrentCompanyChange,
  useHandleCurrentCompanyChangeProperty,
} from '../common/hooks/useHandleCurrentCompanyChange';

export function OnlinePayments() {
  const [t] = useTranslation();

  useTitle('online_payments');

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('online_payments'), href: '/settings/online_payments' },
  ];

  const company = useInjectCompanyChanges();

  const handleChange = useHandleCurrentCompanyChange();
  const handleChangeProperty = useHandleCurrentCompanyChangeProperty();

  const onSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();

  return (
    <Settings
      title={t('online_payments')}
      breadcrumbs={pages}
      docsLink="docs/basic-settings/#online_payments"
      onSaveClick={onSave}
      onCancelClick={onCancel}
    >
      <Card title={t('settings')}>
        <Element leftSide={t('auto_bill_on')}>
          <SelectField
            id="settings.auto_bill_date"
            value={company?.settings.auto_bill_date || 'on_send_date'}
            onChange={handleChange}
          >
            <option value="on_send_date">{t('send_date')}</option>
            <option value="on_due_date">{t('due_date')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('use_available_credits')}>
          <SelectField
            value={company?.settings.use_credits_payment || 'off'}
            id="settings.use_credits_payment"
            onChange={handleChange}
          >
            <option value="always">{t('enabled')}</option>
            <option value="option">{t('show_option')}</option>
            <option value="off">{t('off')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('allow_over_payment')}>
          <Toggle
            label={t('allow_over_payment_help')}
            id="allow_over_payment"
            checked={
              company?.settings.client_portal_allow_over_payment || false
            }
            onChange={(value) =>
              handleChangeProperty(
                'settings.client_portal_allow_over_payment',
                value
              )
            }
          />
        </Element>

        <Element leftSide={t('allow_under_payment')}>
          <Toggle
            label={t('allow_under_payment_help')}
            id="allow_under_payment"
            checked={
              company?.settings.client_portal_allow_under_payment || false
            }
            onChange={(value) =>
              handleChangeProperty(
                'settings.client_portal_allow_under_payment',
                value
              )
            }
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
