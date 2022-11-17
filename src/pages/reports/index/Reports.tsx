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
import { SelectField } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Identifier =
  | 'client'
  | 'contact'
  | 'credit'
  | 'document'
  | 'expense'
  | 'invoice'
  | 'invoice_item'
  | 'quote'
  | 'quote_item'
  | 'recurring_invoice'
  | 'payment'
  | 'product'
  | 'task'
  | 'profit_loss';

interface Report {
  identifier: Identifier;
  label: string;
  endpoint: string;
  groups: Group[];
  dates: Date[];
  payload: Payload;
}

interface Group {
  identifier: string;
  label: string;
  subgroups: Subgroup[];
}

interface Date {
  identifier: 'date' | 'due_date';
  label: string;
}

interface Subgroup {
  identifier: string;
  label: string;
}

interface Payload {
  start_date: string;
  end_date: string;
  date_key: string;
  date_range: string;
  report_keys: string[];
  send_email: boolean;
}

const reports: Report[] = [
  {
    identifier: 'client',
    label: 'client',
    endpoint: '/api/v1/reports/clients',
    groups: [
      {
        identifier: 'name',
        label: 'name',
        subgroups: [],
      },
      {
        identifier: 'contact_email',
        label: 'contact_email',
        subgroups: [],
      },
      {
        identifier: 'id_number',
        label: 'id_number',
        subgroups: [],
      },
      {
        identifier: 'vat_number',
        label: 'vat_number',
        subgroups: [],
      },
      {
        identifier: 'currency',
        label: 'currency',
        subgroups: [],
      },
      {
        identifier: 'country',
        label: 'country',
        subgroups: [],
      },
      {
        identifier: 'created_at',
        label: 'created_at',
        subgroups: [
          { identifier: 'day', label: 'day' },
          { identifier: 'week', label: 'week' },
          { identifier: 'month', label: 'month' },
          { identifier: 'year', label: 'year' },
        ],
      },
    ],
    dates: [],
    payload: {
      start_date: '',
      end_date: '',
      date_key: '',
      date_range: '',
      report_keys: [],
      send_email: false,
    },
  },
];

interface Range {
  identifier: string;
  label: string;
}

const ranges: Range[] = [
  { identifier: 'all', label: 'all' },
  { identifier: 'last7', label: 'last_7_days' },
  { identifier: 'last30', label: 'last_30_days' },
  { identifier: 'this_month', label: 'this_month' },
  { identifier: 'last_month', label: 'last_month' },
  { identifier: 'this_quarter', label: 'this_quarter' },
  { identifier: 'last_quarter', label: 'last_quarter' },
  { identifier: 'this_year', label: 'this_year' },
  { identifier: 'custom', label: 'custom' },
];

export function Reports() {
  const { documentTitle } = useTitle('reports');
  const { t } = useTranslation();

  const [report, setReport] = useState<Report>(reports[0]);
  const [group, setGroup] = useState<Group>();
  const [subgroup, setSubgroup] = useState<Subgroup>();
  const [range, setRange] = useState<Range>();

  const pages: Page[] = [{ name: t('reports'), href: '/reports' }];

  const handleReportChange = (identifier: Identifier) => {
    const report = reports.find((report) => report.identifier === identifier);

    if (report) {
      setReport(report);
    }
  };

  const handleGroupChange = (identifier: string) => {
    const group = report.groups.find(
      (group) => group.identifier === identifier
    );

    if (group) {
      setGroup(group);
    }
  };

  const handleSubgroupChange = (identifier: string) => {
    const subgroup = group?.subgroups.find(
      (subgroup) => subgroup.identifier === identifier
    );

    if (subgroup) {
      setSubgroup(subgroup);
    }
  };

  const handleRangeChange = (identifier: string) => {
    const range = ranges.find((range) => range.identifier === identifier);

    if (range) {
      setRange(range);
    }
  };

  useEffect(() => {
    setGroup(undefined);
  }, [report]);

  useEffect(() => {
    setSubgroup(undefined);
  }, [group]);

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-6 h-max">
          <Element leftSide={t('report')}>
            <SelectField
              onValueChange={(value) => handleReportChange(value as Identifier)}
            >
              {reports.map((report, i) => (
                <option key={i}>{t(report.label)}</option>
              ))}
            </SelectField>
          </Element>

          {report.groups.length > 0 && (
            <Element leftSide={t('group')}>
              <SelectField
                onValueChange={(value) => handleGroupChange(value)}
                withBlank
              >
                {report.groups.map((group, i) => (
                  <option value={group.identifier} key={i}>
                    {t(group.label)}
                  </option>
                ))}
              </SelectField>
            </Element>
          )}

          {group && group.subgroups.length > 0 && (
            <Element leftSide={t('subgroup')}>
              <SelectField
                onValueChange={(value) => handleSubgroupChange(value)}
              >
                {group.subgroups.map((subgroup, i) => (
                  <option value={subgroup.identifier} key={i}>
                    {t(subgroup.label)}
                  </option>
                ))}
              </SelectField>
            </Element>
          )}
        </Card>

        <Card className="col-span-6 h-max">
          {report.dates.length > 0 && (
            <Element leftSide={t('date')}>
              <SelectField>
                {report.dates.map((date, i) => (
                  <option value={date.identifier} key={i}>
                    {t(date.label)}
                  </option>
                ))}
              </SelectField>
            </Element>
          )}

          <Element leftSide={t('range')}>
            <SelectField onValueChange={(value) => handleRangeChange(value)}>
              {ranges.map((range, i) => (
                <option value={range.identifier} key={i}>
                  {t(range.label)}
                </option>
              ))}
            </SelectField>
          </Element>
        </Card>
      </div>
    </Default>
  );
}
