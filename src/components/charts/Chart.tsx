/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from 'axios';
import { endpoint, fetcher, request } from 'common/helpers';
import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Props = {
  data:{}
};
   
export default function Chart({data}: Props) {
  


  const TestData= [
    {
      name: 'Page A',
      uv: 5000,
      pv: 10000,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 0,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 0,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 200,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 0,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 0,
      pv: 4300,
      amt: 2100,
    },
  
  ];
  return (
    
    <AreaChart width={730} height={250} data={TestData}
  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
  <defs>
    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
    </linearGradient>
    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <XAxis dataKey="name" />
  <YAxis />
  <CartesianGrid strokeDasharray="3 3" />
  <Tooltip />
  <Legend/>
  <Area type="linear" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
  <Area type="linear" dataKey="pv" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
</AreaChart>
      
    
  );
}
