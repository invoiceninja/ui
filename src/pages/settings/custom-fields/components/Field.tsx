/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useShouldDisableCustomFields } from '$app/common/hooks/useShouldDisableCustomFields';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardContainer, Element } from '../../../../components/cards';
import { InputField, SelectField } from '../../../../components/forms';
import { ArrowRight } from '$app/components/icons/ArrowRight';
import { useColorScheme } from '$app/common/colors';
import { ArrowDown } from '$app/components/icons/ArrowDown';

export enum AvailableTypes {
  SingleLineText = 'single_line_text',
  MultiLineText = 'multi_line_text',
  Switch = 'switch',
  Dropdown = 'dropdown',
  Date = 'date',
}

interface Props {
  field: string;
  initialValue?: string;
  placeholder: string;
  onChange?: (value: string, field: string, type: AvailableTypes) => unknown;
  noExternalPadding?: boolean;
  withArrowAsSeparator?: boolean;
}

export function Field(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const [initialValue, setInitialValue] = useState('');
  const [dropdownInitialValue, setDropdownInitialValue] = useState('');

  const disabledInputCustomFields = useShouldDisableCustomFields();

  const [dropdownType, setDropdownType] = useState<AvailableTypes>(
    AvailableTypes.SingleLineText
  );

  const dropdownTypes = [
    AvailableTypes.SingleLineText,
    AvailableTypes.MultiLineText,
    AvailableTypes.Switch,
    AvailableTypes.Dropdown,
    AvailableTypes.Date,
  ];

  const inputRef = useRef<HTMLInputElement>();
  const dropdownInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (props.initialValue) {
      const initialValueParts = props.initialValue.split('|');

      if (!props.initialValue.includes('|')) {
        setDropdownType(AvailableTypes.MultiLineText);
      } else {
        if (dropdownTypes.includes(initialValueParts[1] as AvailableTypes)) {
          setDropdownType(initialValueParts[1] as AvailableTypes);
        } else {
          setDropdownType(AvailableTypes.Dropdown);
          setDropdownInitialValue(initialValueParts[1]);
        }
      }

      setInitialValue(initialValueParts[0]);
    }
  }, []);

  const handleChange = (currentType?: AvailableTypes) => {
    if (currentType) {
      setDropdownType(currentType);
    }

    const adjustedCurrentType = currentType || dropdownType;

    const type =
      adjustedCurrentType === AvailableTypes.Dropdown
        ? dropdownInputRef.current?.value
            .split(',')
            .map((part) => part.trim())
            .join(',')
        : adjustedCurrentType;

    const currentValue =
      type === 'multi_line_text'
        ? `${inputRef.current?.value || ''}`
        : `${inputRef.current?.value || ''}|${type}`;

    props.onChange &&
      props.onChange(currentValue, props.field, adjustedCurrentType);
  };

  if (props.withArrowAsSeparator) {
    return (
      <>
        <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-3 items-center justify-between py-3 text-sm">
          <div className="w-full sm:w-2/6">
            <InputField
              id={props.field}
              innerRef={inputRef}
              placeholder={props.placeholder}
              onValueChange={() => handleChange()}
              value={initialValue}
              disabled={disabledInputCustomFields}
            />
          </div>

          <div className="hidden sm:inline-block">
            <ArrowRight size="1.2rem" color={colors.$17} strokeWidth="1.5" />
          </div>

          <div className="inline-block sm:hidden">
            <ArrowDown size="1.2rem" color={colors.$17} strokeWidth="1.5" />
          </div>

          <div className="w-full sm:w-4/6">
            <SelectField
              value={dropdownType}
              onValueChange={(value) => handleChange(value as AvailableTypes)}
              dismissable={false}
              customSelector
            >
              <option value="single_line_text">{t('single_line_text')}</option>
              <option value="multi_line_text">{t('multi_line_text')}</option>
              <option value="switch">{t('switch')}</option>
              <option value="dropdown">{t('dropdown')}</option>
              <option value="date">{t('date')}</option>
            </SelectField>
          </div>
        </div>

        {dropdownType === AvailableTypes.Dropdown && (
          <InputField
            id="multi_line_text"
            innerRef={dropdownInputRef}
            placeholder={t('comma_sparated_list')}
            value={dropdownInitialValue}
            onValueChange={() => handleChange()}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Element
        noExternalPadding={props.noExternalPadding}
        leftSide={
          <InputField
            id={props.field}
            innerRef={inputRef}
            placeholder={props.placeholder}
            onValueChange={() => handleChange()}
            value={initialValue}
            disabled={disabledInputCustomFields}
          />
        }
      >
        <SelectField
          value={dropdownType}
          onValueChange={(value) => handleChange(value as AvailableTypes)}
          dismissable={false}
          customSelector
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
            id="multi_line_text"
            innerRef={dropdownInputRef}
            placeholder={t('comma_sparated_list')}
            value={dropdownInitialValue}
            onValueChange={() => handleChange()}
          />
        </CardContainer>
      )}
    </>
  );
}
