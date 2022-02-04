/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InfoCard } from 'components/InfoCard';
import React from 'react';

type Props = {
    Title:string,
    Amount:number,
    Currency:string,
    className?:string
};

export default function Total(props: Props) {



  
return <div className="col-span-12 lg:col-span-3"><InfoCard className='h-full w-1/3' title={props.Title} value={`${props.Currency} ${new Intl.NumberFormat().format(props.Amount)}`}></InfoCard></div>
        
}
