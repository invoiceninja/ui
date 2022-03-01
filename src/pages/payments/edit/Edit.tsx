/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputField, Textarea } from '@invoiceninja/forms';
import { usePaymentQuery } from 'common/queries/payments';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: payment } = usePaymentQuery({ id });
  return (
    <Default>
      <Container>
        <div className="bg-white p-8 w-full rounded shadow my-4">
          <InputField label={t('client')}></InputField>
          <InputField label={t('amount')}></InputField>
          <InputField label={t('payment_date')} type="date"></InputField>
          <InputField label={t('payment_type')}></InputField>
          <InputField label={t('transaction_reference')}></InputField>
          <Textarea label={t('private_notes')}></Textarea>
        </div>
        {console.log(payment?.data.data)}
        <div className="bg-white p-8 w-full rounded shadow my-4">{id}</div>
      </Container>
    </Default>
  );
}
