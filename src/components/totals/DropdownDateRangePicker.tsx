/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Datepicker, SelectField } from '@invoiceninja/forms';
import { Modal } from 'components/Modal';
import React, { ChangeEvent, useState } from 'react';
import { Calendar, DateRangePicker } from 'react-date-range';

type Props = {
  start_date: string;
  end_date: string;
  handleDateChange: any;
};

export default function DropdownDateRangePicker(props: Props) {
    const selectionRange = {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
      }
    const [IsOpenModal, setIsOpenModal] = useState(false);
  var now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  return (
    <div>
      {' '}
      <SelectField
        defaultValue={'test'}
        className={
          ' orm-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none '
        }
        onChange={(event:ChangeEvent<HTMLInputElement>)=>{
            if(event.target.value==='Custom'){
                console.log('test modal')
                setIsOpenModal(true)   
            }
            props.handleDateChange(event)}}
      >
        <option selected hidden>
          {props.end_date}-{props.start_date}{' '}
        </option>
        <option
          value={[
            new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
              .toISOString()
              .split('T')[0],
            now.toISOString().split('T')[0],
          ]}
        >
          Last 7 Days
        </option>
        <option
          value={[
            new Date(new Date().setDate(now.getDate() - 30))
              .toISOString()
              .split('T')[0],
            now.toISOString().split('T')[0],
          ]}
        >
          Last 30 Days
        </option>
        <option
          value={[
            new Date(now.getFullYear(), now.getMonth(), 2)
              .toISOString()
              .split('T')[0],
            new Date(now.getFullYear(), now.getMonth() + 1, 1)
              .toISOString()
              .split('T')[0],
          ]}
        >
          This Month
        </option>
        <option
          value={[
            new Date(
              now.getFullYear() - (now.getMonth() > 0 ? 0 : 1),
              (now.getMonth() - 1 + 12) % 12,
              1
            )
              .toISOString()
              .split('T')[0],
            new Date(now.getFullYear(), now.getMonth(), 0)
              .toISOString()
              .split('T')[0],
          ]}
        >
          Last Month
        </option>
        <option
          value={[
            new Date(now.getFullYear(), quarter * 3, 1)
              .toISOString()
              .split('T')[0],
            new Date(
              new Date(now.getFullYear(), quarter * 3, 1).getFullYear(),
              new Date(now.getFullYear(), quarter * 3, 1).getMonth() + 3,
              0
            )
              .toISOString()
              .split('T')[0],
          ]}
        >
          This Quarter
        </option>
        <option
          value={[
            new Date(now.getFullYear(), quarter * 3 - 3, 1)
              .toISOString()
              .split('T')[0],
            new Date(
              new Date(now.getFullYear(), quarter * 3 - 3, 1).getFullYear(),
              new Date(now.getFullYear(), quarter * 3 - 3, 1).getMonth() + 3,
              0
            )
              .toISOString()
              .split('T')[0],
          ]}
        >
          Last Quarter
        </option>
        <option
          value={[
            new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
            new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0],
          ]}
        >
          This Year
        </option>
        <option
          value={[
            new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0],
            new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0],
          ]}
        >
          Last Year
        </option>
        <option>Custom</option>
      </SelectField>
      
      <Modal overFlow={true} title={'Select custom date range'} visible={IsOpenModal} onClose={()=>{
          setIsOpenModal(false)
      }} >
          <div className='flex justify-center flex-col'>
              <p>Start date</p>
          <Datepicker></Datepicker>
          <br></br>
          <p>End date</p>
          <Datepicker></Datepicker>
          </div>
      </Modal>
    </div>
  );
}
