/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Button, Datepicker, SelectField } from '@invoiceninja/forms';
import { AxiosResponse } from 'axios';
import { endpoint, request } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import Chart from 'components/charts/Chart';
import { InfoCard } from 'components/InfoCard';

import React, { useEffect, useRef, useState } from 'react';

import Total from './Total';

type Props = {};

export default function Totals({}: Props) {
  let start_date = '2019-02-02';
  let end_date = '2022-02-02';
  const values: {} = {
    start_date,
    end_date,
  };
  const [Totals, setTotals] = useState({});
  const [Currencies, setCurrencies] = useState({});
  const date = useRef(HTMLInputElement);
  const [ChartData, setChartData] = useState({});
  const [Currency, setCurrency] = useState(Number);
  useEffect(() => {
    request(
      'POST',
      endpoint('/api/v1/charts/totals'),
      values,
      defaultHeaders
    ).then((response: AxiosResponse) => {
     // console.log(response.data);
      setTotals(response.data);
      setCurrencies(response.data.currencies);
    });
    request(
      'POST',
      endpoint('/api/v1/charts/chart_summary'),
      { start_date, end_date },
      defaultHeaders
    ).then((response: AxiosResponse) => {
        setChartData(Object.entries(response.data).map(([key,value])=>{if(Number(key)==Currency) console.log("value",value)}))
        console.log("data:")
console.log(ChartData)
    });
  }, []);

  return (
    <div>
      <div className="">
        {Object.entries(Currencies).map(([key, value]) => {
          return (
            <Button
              value={value}
              type="secondary"
              onClick={() => {
                setCurrency(Number(key));
                console.log(Currency);
              }}
            >
              {String(value)}
            </Button>
          );
        })}
        <SelectField
          defaultValue={'test'}
          innerRef={date}
          onChange={() => {
            //fix lint err
            console.log(date.current.value);
            if (date.current.value === 'Custom') {
              //todo open modal with date picker components like in v5 ui
              console.log('modal open');
            }
          }}
        >
          <option selected hidden>
            current date sellection
          </option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Quarter</option>
          <option>Last Month</option>
          <option>This Quarter</option>
          <option>Last Quarter</option>
          <option>This Year</option>
          <option>Last Year</option>
          <option>Custom</option>
        </SelectField>
        <InfoCard title="Total Revenue" value={70000.52}></InfoCard>
        <Total Title="Total Expenses" Amount={70000.52} Currency="gbp"></Total>
        <Total Title="Outstanding" Amount={70000.52} Currency="BAM"></Total>
      </div>
      {ChartData &&
      <Chart
       
        data={ChartData}
      ></Chart>
}
      {JSON.stringify(ChartData)}
    </div>
  );
}
