/**
* Invoice Ninja (https://invoiceninja.com).
*
* @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
*
* @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
*
* @license https://www.elastic.co/licensing/elastic-license
*/

import { useStaticsQuery } from "common/queries/statics";
import { getExchangeRate } from "pages/payments/common/helpers/resolve-exchange-rate";
import { useTranslation } from "react-i18next";
import { Element } from "./cards";
import { InputField, SelectField } from "./forms";

interface Props{
    setFieldValue:any;
    amount:any
    exchange_rate:any
    exchange_currency_id:any
    currency_id:any
}
export function ConvertCurrency(props:Props) {
    const {data:statics}=useStaticsQuery();
    const [t]=useTranslation()
  return (
    
        <>
        {
          console.log("props:",props)
        }
          <Element leftSide={t('currency')}>
            <SelectField
              value={props.exchange_currency_id}
              onChange={(event: any) => {
                console.log(1)
                props.setFieldValue(
                  'exchange_rate',
                  getExchangeRate(
                    props.currency_id,
                    event.target.value,statics
                  )
                );                  console.log(2)

                props.setFieldValue(
                  'exchange_currency_id',
                  event.target.value
                );
              }}
            >
              <option value=""></option>
              {statics?.data.currencies.map((element: any, index: any) => {
                return (
                  <option value={element.id} key={index}>
                    {element.name}
                  </option>
                );
              })}
            </SelectField>
          </Element>
          <Element leftSide={t('exchange_rate')}>
            <InputField
              onChange={(event: any) => {
                props.setFieldValue('exchange_rate', event.target.valeu);
              }}
              value={props.exchange_rate}
            />
          </Element>
          <Element leftSide={t('converted_amount')}>
            <InputField
              value={props.amount * props.exchange_rate}
            />
          </Element>
        </>
        )
}
