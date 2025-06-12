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
import { useColorScheme } from '$app/common/colors';
import classNames from 'classnames';

export default function EmailHistory() {
  const [t] = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailRecords, setEmailRecords] = useState<EmailRecordType[]>([]);

  const fetchEmailHistory = async () => {
    const response = await queryClient
      .fetchQuery(
        ['/api/v1/quotes', id, 'emailHistory'],
        () =>
          request('POST', endpoint('/api/v1/emails/entityHistory'), {
            entity: 'quote',
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
    <Card
      title={t('email_history')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
    >
      <div
        className={classNames('flex w-full px-2 pt-2', {
          'pb-10': emailRecords?.length,
          'pb-6': !emailRecords.length,
          'justify-center': emailRecords.length,
        })}
      >
        {isLoading && (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        )}

        {!isLoading && !emailRecords.length && (
          <div className="text-sm px-4 pt-3">{t('email_history_empty')}</div>
        )}

        <div className="flex flex-col w-full lg:w-2/4 space-y-2">
          {emailRecords.map((emailRecord, index) => (
            <EmailRecord
              key={index}
              className="py-4"
              emailRecord={emailRecord}
              index={index}
              withAllBorders
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
