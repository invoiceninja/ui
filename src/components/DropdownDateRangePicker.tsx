/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { Button, SelectField } from '@invoiceninja/forms';
import { Modal } from 'components/Modal';
import { ChangeEvent, useState } from 'react';
import { Calendar } from 'react-feather';
import { useTranslation } from 'react-i18next';

type Props = {
  startDate: string;
  endDate: string;
  handleDateChange: any;
};

export function DropdownDateRangePicker(props: Props) {
  const [isOpenModal, setisOpenModal] = useState(false);

  let customStartDate: string = props.startDate;
  let customEndDate: string = props.endDate;
  const now = new Date();
  const [t] = useTranslation();

  const quarter = Math.floor(now.getMonth() / 3);
  return (
    <div className="  flex justify-end items-center">
      <Calendar className="mx-2" />{' '}
      <SelectField
        defaultValue={props.startDate + '/' + props.startDate}
        className={
          ' orm-select appearance-none block w-44 px-3 py-1.5 text-base font-normal  text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none '
        }
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          event.preventDefault();
          if (event.target.value === 'Custom') {
            setisOpenModal(true);
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
          {t('last_7_days')}
        </option>
        <option
          value={[
            new Date(new Date().setDate(now.getDate() - 30))
              .toISOString()
              .split('T')[0],
            now.toISOString().split('T')[0],
          ]}
        >
          {t('last_30_days')}
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
          {t('this_month')}
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
          {t('last_month')}
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
          {t('current_quarter')}
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
          {t('last_quarter')}
        </option>
        <option
          value={[
            new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
            new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0],
          ]}
        >
          {t('this_year')}
        </option>
        <option
          value={[
            new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0],
            new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0],
          ]}
        >
          {t('last_year')}
        </option>
        <option value={'Custom'}>{`${t('custom_range')}`}</option>
      </SelectField>
      <Modal
        title={t('custom_range')}
        visible={isOpenModal}
        onClose={() => {
          setisOpenModal(false);
        }}
      >
        <div className="flex justify-center flex-col my-3">
          <p>{`${t('start')} ${t('date')}`}</p>
          <input
            type="date"
            defaultValue={props.startDate}
            onChange={(event) => {
              customStartDate = event.target.value;
            }}
          ></input>

          <br></br>
          <p>{`${t('end')} ${t('date')}`}</p>
          <input
            type="date"
            defaultValue={props.endDate}
            onChange={(event) => {
              customEndDate = event.target.value;
            }}
          ></input>

          <br></br>
          <Button
            className="my-2"
            type="primary"
            onClick={() => {
              props.handleDateChange(customStartDate + ',' + customEndDate);
              setisOpenModal(false);
            }}
          >
            Ok
          </Button>
        </div>
      </Modal>
    </div>
  );
}
