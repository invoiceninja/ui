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
import {DateRangePicker } from 'react-date-range'
import React, { useEffect, useState } from 'react';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import Total from './Total';

type Props = {};

export default function Totals({}: Props) {
    const [Totals, setTotals] = useState([]);
  const [Currencies, setCurrencies] = useState([]);
  const [ChartData, setChartData] = useState([]);
  const [Currency, setCurrency] = useState(1);
  let start_date = '2015-02-02';
  let end_date = '2022-02-02';
  const body: {} = {
    start_date,
    end_date,
  };
  const getTotals=()=>{
    request(
        'POST',
        endpoint('/api/v1/charts/totals'),
        body,
        defaultHeaders
      ).then((response: AxiosResponse) => {
          console.log("getting totals data:")
        console.log(response.data);
        setTotals(response.data);
        
        setCurrencies(response.data.currencies);
        console.log("currencies")

        console.log(Totals[Currency])
      });

  }

  const getChartData=()=>{
    request(
        'POST',
        endpoint('/api/v1/charts/chart_summary'),
       body,
        defaultHeaders
      ).then((response: AxiosResponse) => {
          //setChartData(Object.entries(response.data).map(([key,value])=>{if(Number(key)==Currency) console.log("value",value)}))
          console.log("getting chart data:")
  console.log(response.data)
      });
  }
  const selectionRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  }
  
  useEffect(() => {
getTotals()
getChartData()
    
  }, []);

  return (
    <div>
      <div className="">
        {Currencies && Object.entries(Currencies).map(([key, value]) => {
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


   
      <DateRangePicker 
      color='#000000'
      rangeColors={['#000000']}
        ranges={[selectionRange]}
        onChange={(data)=>{
            console.log(data.selection.startDate)
        }}
      />
    
         <div className="">

         <Total Title="Total Revenue" Amount={23423423} Currency={Currencies[Currency]}></Total>
        <Total Title="Total Expenses" Amount={70000.52} Currency={Currencies[Currency]}></Total>
        <Total Title="Outstanding" Amount={70000.52} Currency={Currencies[Currency]}></Total>
         </div>
    
   
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
