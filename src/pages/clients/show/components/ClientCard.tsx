/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

 import { Client } from 'common/interfaces/client';
 import { InfoCard } from 'components/InfoCard';
 import { useTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';
 
 interface Props {
    client: Client | undefined;
   }
   
 export function ClientCard(props: Props) {
   const [t] = useTranslation();

   return (
     <>
       {props?.client && (
         <div className="col-span-12 lg:col-span-3">
           <InfoCard
             title={t('client')}
             value={
                <Link to={generatePath('/clients/:id', { id: props.client.id })}>
                    {props?.client?.display_name}
                </Link>
             }
             className="h-full"
           />
         </div>
       )}
     </>
   );
 }
 