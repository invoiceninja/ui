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
    Amount:string,
    Currency:string,
    className?:string
    child?:any
};

export default function Total(props: Props) {



  
return <InfoCard className='w-full h-44'  title={props.Title} value={<>

<div className=' text-2xl w-full h-24 py-4 font-black flex justify-start '>


{props.Currency} {new Intl.NumberFormat().format(Number(props.Amount))}


</div>
</>


}></InfoCard>
        
}
