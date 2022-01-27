/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ChangeEvent, HTMLInputTypeAttribute, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardContainer, Element } from '../../../../components/cards';
import { InputField, SelectField } from '../../../../components/forms';

export enum AvailableTypes {
  SingleLineText = 'single_line_text',
  MultiLineText = 'multi_line_text',
  Switch = 'switch',
  Dropdown = 'dropdown',
  Date = 'date',
}

interface Props {
  field: string;
  placeholder: string;
  onChange?: (
    field: string,
    value: string,
    type: AvailableTypes,
    dropdownContent?: string
  ) => unknown;
}

export function Field(props: Props) {
  const [t] = useTranslation();

  const [inputType, setInputType] = useState<AvailableTypes>(
    AvailableTypes.SingleLineText
  );

  const [dropdownContent, setDropdownContent] = useState('');

  const selectRef = useRef();
  const inputRef = useRef<HTMLInputElement>();

  const handleChange = () => {
    props.onChange &&
      props.onChange(
        props.field,
        inputRef.current?.value || '',
        inputType,
        dropdownContent
      );
  };

  return (
    <>
      <Element
        leftSide={
          <InputField
            innerRef={inputRef}
            id={props.field}
            placeholder={props.placeholder}
            onChange={handleChange}
          />
        }
      >
        <SelectField
          innerRef={selectRef}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setInputType(event.target.value as AvailableTypes);
            handleChange();
          }}
        >
          <option value="single_line_text">{t('single_line_text')}</option>
          <option value="multi_line_text">{t('multi_line_text')}</option>
          <option value="switch">{t('switch')}</option>
          <option value="dropdown">{t('dropdown')}</option>
          <option value="date">{t('date')}</option>
        </SelectField>
      </Element>

      {inputType === AvailableTypes.Dropdown && (
        <CardContainer>
          <InputField
            id="multi_line_text"
            placeholder={t('comma_sparated_list')}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setDropdownContent(event.target.value);
              handleChange();
            }}
          />
        </CardContainer>
      )}
    </>
  );
}
