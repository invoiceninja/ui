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
import { EmailRecord as EmailRecordType } from '$app/common/interfaces/email-history';
import { EmailRecord } from '$app/components/EmailRecord';
import { InfoCard } from '$app/components/InfoCard';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

export function EmailHistory() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  const { id } = useParams();

  const [emailRecords, setEmailRecords] = useState<EmailRecordType[]>([]);

  const fetchEmailHistory = async () => {
    const response = await queryClient.fetchQuery(
      ['/api/v1/clients', id, 'emailHistory'],
      () =>
        request(
          'POST',
          endpoint('/api/v1/emails/clientHistory/:id', { id })
        ).then((response) => response.data),
      { staleTime: Infinity }
    );

    setEmailRecords(response);
  };

  useEffect(() => {
    fetchEmailHistory();
  }, []);

  return (
    <>
      {Boolean(emailRecords.length) && (
        <div className="col-span-12 lg:col-span-5 xl:col-span-4">
          <InfoCard
            title={t('email_history')}
            className="max-h-96 overflow-y-auto"
            value={emailRecords.map(
              (emailRecord, index) =>
                emailRecord && (
                  <EmailRecord
                    key={index}
                    emailRecord={emailRecord}
                    index={index}
                    withBottomBorder
                    withEntityNavigationIcon
                  />
                )
            )}
          />
        </div>
      )}
    </>
  );
}
