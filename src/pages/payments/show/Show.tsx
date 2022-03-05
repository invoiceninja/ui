/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Button, InputField } from '@invoiceninja/forms';
import axios from 'axios';
import paymentType from 'common/constants/payment-type';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';

import { usePaymentQuery } from 'common/queries/payments';
import { useStaticsQuery } from 'common/queries/statics';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

export function Show() {
  const [t] = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [defaultPaymentType, setpaymentType] = useState('');
  const pages: BreadcrumRecord[] = [
    { name: t('payments'), href: '/payments' },
    { name: t('payment'), href: generatePath('/payments/:id', { id: id }) },
  ];
  const [gateway, setgateway] = useState('');

  const { data: payment } = usePaymentQuery({ id });

  const { data: statics } = useStaticsQuery();
  const getCompanyGateway = () => {
    if (payment?.data.data.company_gateway_id) {
      axios
        .get(
          endpoint('/api/v1/company_gateways/:id', {
            id: payment?.data.data.company_gateway_id,
          }),
          {
            headers: defaultHeaders,
          }
        )
        .then((data) => {
          setgateway(data.data.data.label);
        });
    }
  };
  useEffect(() => {
    getCompanyGateway();
    const type = Object.entries(paymentType).find(([value]: any) => {
      return value === payment?.data.data.type_id;
    });
    type ? setpaymentType(type[1]) : setpaymentType('');
  }, [payment]);

  return (
    <Default breadcrumbs={pages} title={t('payment')} docsLink="docs/payments/">
      <Container>
        <Card title={payment?.data.data.number}>
          <div className="bg-white p-6 w-full rounded shadow my-3">
            <Element leftSide={t('client')}>
              <InputField
                disabled
                value={payment?.data.data.client.display_name}
              />
            </Element>
            <Element leftSide={t('payment_amount')}>
              <InputField disabled value={payment?.data.data.amount} />
            </Element>
            <Element leftSide={t('applied')}>
              <InputField disabled value={payment?.data.data.applied} />
            </Element>

            <Element leftSide={t('invoice_number')}>
              <InputField
                disabled
                value={payment?.data.data.invoices[0]?.number}
              />
            </Element>
            <Element leftSide={t('payment_date')}>
              <InputField disabled value={payment?.data.data.date} />
            </Element>
            <Element leftSide={t('payment_type')}>
              <InputField disabled value={t(defaultPaymentType)} />
            </Element>

            <Element leftSide={t('gateway')}>
              <InputField disabled value={gateway} />
            </Element>

            <Element leftSide={t('transaction_reference')}>
              <InputField
                disabled
                value={payment?.data.data.transaction_reference}
              />
            </Element>
            <Element leftSide={t('private_notes')}>
              <InputField disabled value={payment?.data.data.private_notes} />
            </Element>
            <Element leftSide={t("convert_currency")}>
              <Toggle
                disabled
                checked={payment?.data.data.exchange_currency_id}
              />
            </Element>
          </div>

          {payment?.data.data.exchange_currency_id && (
            <div className="bg-white p-6 w-full rounded shadow my-3 z-30">
              <Element leftSide={t('currency')}>
                <InputField
                  disabled
                  value={
                    statics?.data.currencies.find(
                      (element: any) =>
                        element.id === payment?.data.data.exchange_currency_id
                    )?.name
                  }
                />
              </Element>
              <Element leftSide={t('exchange_rate')}>
                <InputField disabled value={payment?.data.data.exchange_rate} />
              </Element>
              {}
              <Element leftSide={t('converted_amount')}>
                <InputField
                  disabled
                  value={
                    Number(payment?.data.data.amount) *
                    Number(payment?.data.data.exchange_rate)
                  }
                />
              </Element>
            </div>
          )}
          <div className="flex justify-end mx-8">
            <Button
              type="primary"
              onClick={(e: any) => {
                e.preventDefault();
                navigate(generatePath('/payments/:id/edit', { id: id }));
              }}
            >
              {t('edit_payment')}
            </Button>
          </div>
        </Card>
      </Container>
    </Default>
  );
}
