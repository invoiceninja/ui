/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { EmailRecord } from '$app/components/EmailRecord';
import { EmailRecord as EmailRecordType } from '$app/common/interfaces/email-history';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';

export default function EmailHistory() {
  const [t] = useTranslation();

  const { id } = useParams();

  const { data: emailRecords, isLoading } = useQuery({
    queryKey: ['/api/v1/invoices', id, 'emailHistory'],
    queryFn: () =>
      request('POST', endpoint('/api/v1/emails/entityHistory'), {
        entity: 'invoice',
        entity_id: id,
      }).then((response) => response.data),
    enabled: Boolean(id),
    staleTime: Infinity,
  });

  return (
    <Card title={t('email_history')}>
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {emailRecords && !(emailRecords as EmailRecordType[]).length && (
        <span className="px-6">{t('nothing_to_see_here')}</span>
      )}

      {(emailRecords as EmailRecordType[] | undefined)?.map(
        (emailRecord, index) => (
          <EmailRecord
            key={index}
            className="py-4"
            emailRecord={emailRecord}
            index={index}
          />
        )
      )}
    </Card>
  );
}
