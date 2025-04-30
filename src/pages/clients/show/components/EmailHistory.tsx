/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
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

  const colors = useColorScheme();
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
        <InfoCard
          title={t('email_history')}
          className="h-full 2xl:h-max col-span-12 lg:col-span-6 xl:col-span-5 2xl:col-span-4 shadow-sm"
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex flex-col pt-2 max-h-96 overflow-y-auto">
            {emailRecords.map(
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
          </div>
        </InfoCard>
      )}
    </>
  );
}
