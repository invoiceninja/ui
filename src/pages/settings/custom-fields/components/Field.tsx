/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ChangeEvent, useEffect, useRef, useState } from 'react';
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
  onChange?: (value: string, field: string, type: AvailableTypes) => unknown;
}

export function Field(props: Props) {
  const [t] = useTranslation();

  const [dropdownType, setDropdownType] = useState<AvailableTypes>(
    AvailableTypes.SingleLineText
  );

  const inputRef = useRef<HTMLInputElement>();
  const dropdownInputRef = useRef<HTMLInputElement>();
  const dropdownTypeRef = useRef<HTMLSelectElement>();

  const handleChange = () => {
    const type =
      dropdownTypeRef.current?.value === AvailableTypes.Dropdown
        ? dropdownInputRef.current?.value ||
          ''
            .split(',')
            .map((part) => part.trim())
            .join(',')
        : dropdownTypeRef.current?.value;

    props.onChange &&
      props.onChange(
        `${inputRef.current?.value || ''}|${type}`,
        props.field,
        dropdownTypeRef.current?.value as AvailableTypes
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
          innerRef={dropdownTypeRef}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            setDropdownType(event.target.value as AvailableTypes);
            handleChange();
          }}
          defaultValue={dropdownType}
        >
          <option value="single_line_text">{t('single_line_text')}</option>
          <option value="multi_line_text">{t('multi_line_text')}</option>
          <option value="switch">{t('switch')}</option>
          <option value="dropdown">{t('dropdown')}</option>
          <option value="date">{t('date')}</option>
        </SelectField>
      </Element>

      {dropdownType === AvailableTypes.Dropdown && (
        <CardContainer>
          <InputField
            innerRef={dropdownInputRef}
            id="multi_line_text"
            placeholder={t('comma_sparated_list')}
            onChange={handleChange}
          />
        </CardContainer>
      )}
    </>
  );
}
