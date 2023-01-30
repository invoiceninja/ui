/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { Button, InputField, SelectField } from '@invoiceninja/forms';
import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { Page } from 'components/Breadcrumbs';
import Toggle from 'components/forms/Toggle';
import { Default } from 'components/layouts/Default';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import quarter from 'dayjs/plugin/quarterOfYear';
import { request } from 'common/helpers/request';
import { endpoint } from 'common/helpers';
import { toast } from 'common/helpers/toast/toast';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { AxiosError } from 'axios';

dayjs.extend(quarter);

type StatementStatus = 'all' | 'paid' | 'unpaid';

interface Statement {
  client_id: string;
  end_date: string;
  show_aging_table: boolean;
  show_payments_table: boolean;
  start_date: string;
  status: StatementStatus;
}

export function Statement() {
  const { documentTitle } = useTitle('statement');
  const { t } = useTranslation();
  const { id } = useParams();

  const user = useCurrentUser();

  const pages: Page[] = [
    { name: t('clients'), href: '/clients' },
    { name: t('client'), href: route('/clients/:id', { id }) },
    { name: t('statement'), href: route('/clients/:id/statement', { id }) },
  ];

  const dates = [
    {
      id: 'last_7_days',
      start: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
      end: dayjs().format('YYYY-MM-DD'),
    },
    {
      id: 'last_30_days',
      start: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
      end: dayjs().format('YYYY-MM-DD'),
    },
    {
      id: 'this_month',
      start: dayjs().startOf('month').format('YYYY-MM-DD'),
      end: dayjs().format('YYYY-MM-DD'),
    },
    {
      id: 'last_month',
      start: dayjs().startOf('month').subtract(1, 'month').format('YYYY-MM-DD'),
      end: dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
    },
    {
      id: 'this_quarter',
      start: dayjs().startOf('quarter').format('YYYY-MM-DD'),
      end: dayjs().endOf('quarter').format('YYYY-MM-DD'),
    },
    {
      id: 'last_quarter',
      start: dayjs()
        .subtract(1, 'quarter')
        .startOf('quarter')
        .format('YYYY-MM-DD'),
      end: dayjs().subtract(1, 'quarter').endOf('quarter').format('YYYY-MM-DD'),
    },
    {
      id: 'this_year',
      start: dayjs().startOf('year').format('YYYY-MM-DD'),
      end: dayjs().format('YYYY-MM-DD'),
    },
    {
      id: 'last_year',
      start: dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
      end: dayjs().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
    },
    {
      id: 'custom',
      start: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
      end: dayjs().format('YYYY-MM-DD'),
    },
  ];

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectRange, setSelectRange] = useState<string>('last_7_days');

  const [statement, setStatement] = useState<Statement>({
    client_id: id!,
    start_date: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD'),
    show_aging_table: true,
    show_payments_table: true,
    status: 'all',
  });

  const handleSelectRangeChange = (id: string) => {
    const date = dates.find((date) => date.id === id);

    if (date) {
      setSelectRange(id);
      setStatement((current) => ({
        ...current,
        start_date: date.start,
        end_date: date.end,
      }));
    }
  };

  const downloadPdf = () => {
    if (!iframeRef.current) {
      return;
    }

    toast.processing();

    const link = document.createElement('a');

    link.download = 'statement.pdf';
    link.href = iframeRef.current.src;
    link.target = '_blank';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    toast.dismiss();
  };

  const handleSendEmail = () => {
    toast.processing();

    request(
      'POST',
      endpoint('/api/v1/client_statement?send_email=true'),
      statement
    )
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();
      });
  };

  useEffect(() => {
    toast.processing();

    request('POST', endpoint('/api/v1/client_statement'), statement, {
      responseType: 'arraybuffer',
    })
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        if (iframeRef.current) {
          iframeRef.current.src = url;
        }

        toast.dismiss();
      })
      .catch((error) => {
        console.error(error);
        toast.error();
      });
  }, [statement]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        <div className="flex space-x-3">
          {user?.company_user?.is_admin && (
            <Button onClick={handleSendEmail}>{t('email')}</Button>
          )}
          <Button onClick={downloadPdf}>{t('download')}</Button>
        </div>
      }
      onBackClick={route('/clients/:id', { id })}
    >
      <div className="grid grid-cols-12 space-y-4 xl:space-y-0 xl:gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          <SelectField
            label={t('date_range')}
            value={selectRange}
            onValueChange={handleSelectRangeChange}
          >
            {dates.map((date, index) => (
              <option key={index} value={date.id}>
                {t(date.id)}
              </option>
            ))}
          </SelectField>

          {selectRange === 'custom' && (
            <InputField
              label={t('start_date')}
              type="date"
              value={statement.start_date}
              onValueChange={(value) =>
                value.length > 1 &&
                setStatement((current) => ({ ...current, start_date: value }))
              }
            />
          )}

          {selectRange === 'custom' && (
            <InputField
              label={t('end_date')}
              type="date"
              value={statement.end_date}
              onValueChange={(value) =>
                value.length > 1 &&
                setStatement((current) => ({ ...current, end_date: value }))
              }
            />
          )}
        </Card>

        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          <SelectField
            label={t('status')}
            value={statement.status}
            onValueChange={(value) =>
              setStatement((current) => ({
                ...current,
                status: value as StatementStatus,
              }))
            }
          >
            <option value="all">{t('all')}</option>
            <option value="paid">{t('paid')}</option>
            <option value="unpaid">{t('unpaid')}</option>
          </SelectField>
        </Card>

        <Card className="col-span-12 xl:col-span-4 h-max">
          <Element leftSide={t('payments')}>
            <Toggle
              checked={statement.show_payments_table}
              onValueChange={(value) =>
                setStatement((current) => ({
                  ...current,
                  show_payments_table: value,
                }))
              }
            />
          </Element>

          <Element leftSide={t('aging')}>
            <Toggle
              checked={statement.show_aging_table}
              onValueChange={(value) =>
                setStatement((current) => ({
                  ...current,
                  show_aging_table: value,
                }))
              }
            />
          </Element>
        </Card>
      </div>

      <iframe className="my-6" ref={iframeRef} width="100%" height={1500} />
    </Default>
  );
}
