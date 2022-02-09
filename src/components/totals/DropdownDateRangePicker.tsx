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
import { Modal } from 'components/Modal';
import React, { ChangeEvent, useState } from 'react';
import { Calendar } from 'react-feather';

type Props = {
  start_date: string;
  end_date: string;
  handleDateChange: any;
};

export default function DropdownDateRangePicker(props: Props) {
  const [IsOpenModal, setIsOpenModal] = useState(false);

  let CustomStartDate: string;
  let CustomEndDate: string;
  var now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  return (
    <div className="  flex justify-end items-center">
      <Calendar className="mx-2" />{' '}
      <SelectField
        defaultValue={props.end_date + '/' + props.start_date}
        className={
          ' orm-select appearance-none block w-60 px-3 py-1.5 text-base font-normal  text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none '
        }
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          event.preventDefault();
          if (event.target.value === 'Custom') {
            setIsOpenModal(true);
          } else {
            props.handleDateChange(event.target.value);
          }
        }}
      >
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
      <Modal
        overFlow={true}
        title={'Select custom date range'}
        visible={IsOpenModal}
        onClose={() => {
          setIsOpenModal(false);
        }}
      >
        <div className="flex justify-center flex-col">
          <p>Start date</p>
          <Datepicker
            value={props.start_date}
            onChange={(SelectedDate: string) => {
              CustomStartDate = SelectedDate;
            }}
          ></Datepicker>
          <br></br>
          <p>End date</p>
          <Datepicker
            value={props.end_date}
            onChange={(SelectedDate: string) => {
              CustomEndDate = SelectedDate;
            }}
          ></Datepicker>
          <br></br>
          <Button
            type="primary"
            onClick={() => {
              props.handleDateChange(CustomStartDate + ',' + CustomEndDate);
              setIsOpenModal(false);
            }}
          >
            Ok
          </Button>
        </div>
      </Modal>
    </div>
  );
}
