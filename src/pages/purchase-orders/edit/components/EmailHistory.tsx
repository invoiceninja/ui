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
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';
import { EmailRecord } from '$app/components/EmailRecord';
import { EmailRecord as EmailRecordType } from '$app/common/interfaces/email-history';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export default function EmailHistory() {
  const [t] = useTranslation();

  const { id } = useParams();

  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailRecords, setEmailRecords] = useState<EmailRecordType[]>([]);

  const fetchEmailHistory = async () => {
    const response = await queryClient
      .fetchQuery(
        ['/api/v1/purchase_orders', id, 'emailHistory'],
        () =>
          request('POST', endpoint('/api/v1/emails/entityHistory'), {
            entity: 'purchase_order',
            entity_id: id,
          }),
        { staleTime: Infinity }
      )
      .then((response) => response.data);

    setIsLoading(false);

    setEmailRecords(response);
  };

  useEffect(() => {
    if (id) {
      fetchEmailHistory();
    }
  }, [id]);

  return (
    <Card title={t('email_history')} className="w-full xl:w-2/3">
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {!isLoading && !emailRecords.length && (
        <span className="px-6">{t('email_history_empty')}</span>
      )}

      {emailRecords.map((emailRecord, index) => (
        <EmailRecord
          key={index}
          className="py-4"
          emailRecord={emailRecord}
          index={index}
        />
      ))}
    </Card>
  );
}
