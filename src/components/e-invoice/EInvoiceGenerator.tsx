/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect, useState } from 'react';
import { Button, InputField, SelectField } from '../forms';
import { useTranslation } from 'react-i18next';
import { Element } from '../cards';
import { Icon } from '../icons/Icon';
import { MdDelete } from 'react-icons/md';
import { SearchableSelect } from '../SearchableSelect';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import RandExp from 'randexp';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date } from '$app/common/helpers';
import reactStringReplace from 'react-string-replace';

export type Country = 'italy';

type Payload = Record<string, string | number>;

interface PayloadKey {
  key: string;
  valueType: 'string' | 'number';
  label: string;
  fieldName: string;
}

interface AvailableType {
  key: string;
  label: string;
  fieldName: string;
}

interface Resource {
  rules: Rule[];
  validations: Validation[];
  defaultFields: Record<string, string>;
  components: Component[];
  excluded: string[];
}

interface Rule {
  key: string;
  label: string;
  type: 'dropdown';
  resource: string;
  required: boolean;
}

interface Validation {
  name: string;
  base_type: 'string' | 'decimal' | 'number' | 'date';
  resource: Record<string, string> | [];
  length: number | null;
  fraction_digits: number | null;
  total_digits: number | null;
  max_exclusive: number | null;
  min_exclusive: number | null;
  max_inclusive: number | null;
  min_inclusive: number | null;
  max_length: number | null;
  min_length: number | null;
  pattern: string | null;
  whitespace: boolean | null;
}

interface ElementType {
  name: string;
  base_type: ('string' | 'decimal' | 'number' | 'date') | null;
  resource: Record<string, string> | [];
  length: number | null;
  fraction_digits: number | null;
  total_digits: number | null;
  max_exclusive: number | null;
  min_exclusive: number | null;
  max_inclusive: number | null;
  min_inclusive: number | null;
  max_length: number | null;
  min_length: number | null;
  pattern: string | null;
  whitespace: boolean | null;
  help: string;
  minOccurs: string;
  maxOccurs: string;
}

interface Component {
  type: string;
  help: string;
  choices: string[][];
  elements: ElementType[];
}

interface Props {
  country: Country | undefined;
}
export function EInvoiceGenerator(props: Props) {
  const [t] = useTranslation();

  const { country } = props;

  const { dateFormat } = useCurrentCompanyDateFormats();

  const [rules, setRules] = useState<Rule[]>([]);
  const [errors, setErrors] = useState<ValidationBag>();
  const [excluded, setExcluded] = useState<string[]>([]);
  const [isInitial, setIsInitial] = useState<boolean>(true);
  const [components, setComponents] = useState<Component[]>([]);
  const [eInvoice, setEInvoice] = useState<
    JSX.Element | (JSX.Element | undefined)[]
  >();
  const [defaultFields, setDefaultFields] = useState<Record<string, string>>(
    {}
  );

  let payloadKeys: PayloadKey[] = [];
  let availableTypes: AvailableType[] = [];

  const [payload, setPayload] = useState<Payload>({});
  const [currentAvailableTypes, setCurrentAvailableTypes] = useState<
    AvailableType[]
  >([]);

  const getFieldKey = (label: string | null) => {
    return label?.split('Type')[0];
  };

  const handleChange = (property: string, value: string | number) => {
    setPayload((current) => ({ ...current, [property]: value }));
  };

  const isChoiceFromSameGroup = (
    currentFieldKey: string,
    comparingFieldKey: string
  ) => {
    const topParentType = `${currentFieldKey.split('|')[0]}Type`;
    const parentElementName = currentFieldKey.split('|')[1];
    const elementName = currentFieldKey.split('|')[2];
    const comparingTopParent = `${comparingFieldKey.split('|')[0]}Type`;
    const comparingParentElementName = comparingFieldKey.split('|')[1];
    const comparingElementName = comparingFieldKey.split('|')[2];

    if (
      topParentType !== comparingTopParent ||
      parentElementName !== comparingParentElementName
    ) {
      return false;
    }

    if (currentFieldKey === comparingFieldKey) {
      return false;
    }

    const topParentComponent = components.find(
      ({ type }) => type === topParentType
    );
    const choiceTopParentElementType = topParentComponent?.elements.find(
      ({ name }) => name === parentElementName
    )?.base_type;

    const choiceParentComponent = components.find(
      ({ type }) => type === choiceTopParentElementType
    );

    const choiceGroup = choiceParentComponent?.choices.find((choiceGroup) =>
      choiceGroup.includes(elementName)
    );

    return choiceGroup?.includes(comparingElementName);
  };

  const showField = (key: string) => {
    const fieldsForDisplay = payloadKeys.filter(
      (currentType) =>
        !currentAvailableTypes.find(
          (currentAvailableType) => currentAvailableType.key === currentType.key
        )
    );
    const isInTheGroupWithAnyOther = fieldsForDisplay.some((field) =>
      isChoiceFromSameGroup(field.key, key)
    );

    return isInitial
      ? !availableTypes.find((currentType) => currentType.key === key)
      : !currentAvailableTypes.find((currentType) => currentType.key === key) &&
          !isInTheGroupWithAnyOther;
  };

  const handleDeleteField = (elementKey: string) => {
    const currentType = payloadKeys.find(({ key }) => key === elementKey);

    if (currentType) {
      setCurrentAvailableTypes((current) => [
        ...current,
        {
          key: currentType.key,
          label: currentType.label,
          fieldName: currentType.fieldName,
        },
      ]);

      setPayload((current) => ({
        ...current,
        [currentType.key]:
          typeof current[currentType.key] === 'number' ? 0 : '',
      }));
    }
  };

  const isElementChoice = (elementName: string | null, parentsKey: string) => {
    if (elementName) {
      const topParentType = `${parentsKey.split('->')[0]}Type`;
      const parentElementName = parentsKey.split('->')[1];

      const topParentComponent = components.find(
        ({ type }) => type === topParentType
      );
      const choiceTopParentElementType = topParentComponent?.elements.find(
        ({ name }) => name === parentElementName
      )?.base_type;

      const choiceParentComponent = components.find(
        ({ type }) => type === choiceTopParentElementType
      );

      return choiceParentComponent?.choices.some((choiceGroup) =>
        choiceGroup.some((choice) => choice === elementName)
      );
    }

    return false;
  };

  const renderElement = (element: ElementType, parentsKey: string) => {
    let label = '';
    let leftSideLabel = '';
    const isChoice = isElementChoice(element.name, parentsKey);
    const choiceLabelPart = isChoice ? '(additional option)' : '';
    const fieldKey = `${parentsKey.replace('->', '|')}|${element.name || ''}`;
    const rule = rules.find((rule) => rule.key === element.name);

    if (rule) {
      label = choiceLabelPart ? `${rule.label} ${choiceLabelPart}` : rule.label;
      leftSideLabel = rule.label;
    } else {
      label = `${parentsKey} ${element.name || ''} ${choiceLabelPart}`;
      leftSideLabel = `${element.name} (${parentsKey.split('->')[0]}, ${
        parentsKey.split('->')[1]
      })`;
    }

    const isNumberTypeField =
      element.base_type === 'decimal' || element.base_type === 'number';

    payloadKeys.push({
      key: fieldKey,
      valueType: isNumberTypeField ? 'number' : 'string',
      label,
      fieldName: element.name,
    });

    if (isInitial) {
      const isDefaultField = Object.keys(defaultFields).includes(element.name);

      if (!isDefaultField) {
        availableTypes.push({
          key: fieldKey,
          label,
          fieldName: element.name,
        });
      }
    }

    if (!showField(fieldKey)) {
      return null;
    }

    if (
      typeof element.resource === 'object' &&
      element.resource !== null &&
      Object.keys(element.resource).length
    ) {
      return (
        <Element required={rule?.required} leftSide={leftSideLabel}>
          <div className="flex items-center w-full space-x-3">
            <div className="flex-1">
              <SelectField
                value={payload[fieldKey] || ''}
                onValueChange={(value) => handleChange(fieldKey, value)}
                withBlank
                errorMessage={errors?.errors[fieldKey]}
              >
                {Object.entries(element.resource).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value || key}
                  </option>
                ))}
              </SelectField>
            </div>

            {!rule?.required && (
              <div
                className="cursor-pointer"
                onClick={() => handleDeleteField(fieldKey)}
              >
                <Icon element={MdDelete} size={28} />
              </div>
            )}
          </div>
        </Element>
      );
    }

    if (element.base_type === 'decimal' || element.base_type === 'number') {
      return (
        <Element required={rule?.required} leftSide={leftSideLabel}>
          <div className="flex items-center w-full space-x-3">
            <div className="flex-1">
              <InputField
                type="number"
                value={payload[fieldKey] || 0}
                onValueChange={(value) =>
                  handleChange(
                    fieldKey,
                    parseFloat(value).toFixed(value.split('.')?.[1]?.length)
                  )
                }
                errorMessage={errors?.errors[fieldKey]}
              />
            </div>

            {!rule?.required && (
              <div
                className="cursor-pointer"
                onClick={() => handleDeleteField(fieldKey)}
              >
                <Icon element={MdDelete} size={28} />
              </div>
            )}
          </div>
        </Element>
      );
    }

    if (element.base_type === 'date') {
      return (
        <Element required={rule?.required} leftSide={leftSideLabel}>
          <div className="flex items-center w-full space-x-3">
            <div className="flex-1">
              <InputField
                type="date"
                value={payload[fieldKey] || ''}
                onValueChange={(value) => handleChange(fieldKey, value)}
                errorMessage={errors?.errors[fieldKey]}
              />
            </div>

            {!rule?.required && (
              <div
                className="cursor-pointer"
                onClick={() => handleDeleteField(fieldKey)}
              >
                <Icon element={MdDelete} size={28} />
              </div>
            )}
          </div>
        </Element>
      );
    }

    if (element.base_type !== null) {
      return (
        <Element required={rule?.required} leftSide={leftSideLabel}>
          <div className="flex items-center w-full space-x-3">
            <div className="flex-1">
              <InputField
                value={payload[fieldKey] || ''}
                onValueChange={(value) => handleChange(fieldKey, value)}
                errorMessage={errors?.errors[fieldKey]}
              />
            </div>

            {!rule?.required && (
              <div
                className="cursor-pointer"
                onClick={() => handleDeleteField(fieldKey)}
              >
                <Icon element={MdDelete} size={28} />
              </div>
            )}
          </div>
        </Element>
      );
    }
  };

  const renderComponent = (
    component: Component,
    componentIndex: number,
    topParentType: string,
    lastParentType: string
  ): JSX.Element => {
    return (
      <React.Fragment
        key={`${topParentType}${lastParentType}${component.type}`}
      >
        {Boolean(component.elements.length) &&
          component.elements.map((element) => {
            if (element.base_type?.endsWith('Type')) {
              const componentsList = components.filter(
                (_, index) => componentIndex !== index
              );

              const newComponentIndex = componentsList.findIndex(
                (component) => component.type === element.base_type
              );

              const newComponent = componentsList[newComponentIndex];

              if (newComponent) {
                return renderComponent(
                  { ...newComponent },
                  newComponentIndex,
                  newComponent.elements.length &&
                    newComponent.elements[0].base_type?.endsWith('Type')
                    ? newComponent.type
                    : topParentType,
                  element.name
                );
              }
            } else {
              return renderElement(
                element,
                `${getFieldKey(topParentType)}->${getFieldKey(lastParentType)}`
              );
            }
          })}
      </React.Fragment>
    );
  };

  const createPayload = () => {
    let currentPayload: Payload = {};

    payloadKeys.forEach(({ key, valueType }) => {
      currentPayload = {
        ...currentPayload,
        [key]:
          defaultFields[key.split('|')[2]] || (valueType === 'number' ? 0 : ''),
      };
    });

    setPayload(currentPayload);
  };

  const updateErrors = (
    currentErrors: ValidationBag,
    key: string,
    value: string
  ) => {
    return {
      ...currentErrors,
      errors: {
        ...currentErrors.errors,
        [key]: [value],
      },
    };
  };

  const checkValidation = () => {
    let updatedErrors: ValidationBag = { errors: {}, message: '' };

    Object.entries(payload).forEach(([key, value]) => {
      if (showField(key)) {
        const fieldKey = key.split('|')[2];
        let fieldValidation: ElementType | undefined;

        components.forEach((component) => {
          if (!fieldValidation) {
            fieldValidation = component.elements.find(
              ({ name }) => name === fieldKey
            );
          }
        });

        const fieldRule = rules.find((rule) => rule.key === fieldKey);
        const isRequired = fieldRule?.required;

        if (fieldValidation) {
          const {
            pattern,
            min_inclusive,
            base_type,
            max_inclusive,
            min_exclusive,
            max_exclusive,
            length,
            min_length,
            max_length,
            fraction_digits,
            total_digits,
            whitespace,
          } = fieldValidation;

          if (isRequired && !value) {
            updatedErrors = {
              ...updatedErrors,
              errors: {
                ...updatedErrors.errors,
                [key]: [`${key} is required field!`],
              },
            };
          }

          if (
            length &&
            (value?.toString().length < length ||
              value?.toString().length > length)
          ) {
            updatedErrors = updateErrors(
              updatedErrors,
              key,
              `Value length for the ${fieldKey} field must be ${length}!`
            );
          }

          if (pattern && new RegExp(pattern).test(value.toString()) === false) {
            updatedErrors = updateErrors(
              updatedErrors,
              key,
              `${fieldKey} has wrong pattern, the correct pattern is ${new RandExp(
                pattern as string
              ).gen()} (example)!`
            );
          }

          if (min_inclusive) {
            const updatedValue = base_type === 'date' ? new Date(value) : value;
            const updatedMinInclusive =
              base_type === 'date'
                ? new Date(min_inclusive)
                : parseFloat(min_inclusive.toString());

            if (updatedValue < updatedMinInclusive) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Min inclusive value for ${fieldKey} is ${
                  base_type === 'date'
                    ? date(min_inclusive, dateFormat)
                    : min_inclusive
                }!`
              );
            }
          }

          if (max_inclusive) {
            const updatedValue = base_type === 'date' ? new Date(value) : value;
            const updatedMaxInclusive =
              base_type === 'date'
                ? new Date(max_inclusive)
                : parseFloat(max_inclusive.toString());

            if (updatedValue > updatedMaxInclusive) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Max inclusive value for ${fieldKey} is ${
                  base_type === 'date'
                    ? date(max_inclusive, dateFormat)
                    : max_inclusive
                }!`
              );
            }
          }

          if (min_exclusive && !max_exclusive) {
            const updatedValue = base_type === 'date' ? new Date(value) : value;
            const updatedMinExclusive =
              base_type === 'date'
                ? new Date(min_exclusive)
                : parseFloat(min_exclusive.toString());

            if (updatedValue >= updatedMinExclusive) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Min exclusive value for ${fieldKey} is ${updatedMinExclusive}!`
              );
            }
          }

          if (max_exclusive && !min_exclusive) {
            const updatedValue = base_type === 'date' ? new Date(value) : value;
            const updatedMaxExclusive =
              base_type === 'date'
                ? new Date(max_exclusive)
                : parseFloat(max_exclusive.toString());

            if (updatedValue <= updatedMaxExclusive) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Max exclusive value for ${fieldKey} is ${updatedMaxExclusive}!`
              );
            }
          }

          if (max_exclusive && min_exclusive) {
            const updatedValue = base_type === 'date' ? new Date(value) : value;
            const updatedMinExclusive =
              base_type === 'date'
                ? new Date(min_exclusive)
                : parseFloat(min_exclusive.toString());
            const updatedMaxExclusive =
              base_type === 'date'
                ? new Date(max_exclusive)
                : parseFloat(max_exclusive.toString());

            if (
              updatedValue <= updatedMaxExclusive &&
              updatedValue >= updatedMinExclusive
            ) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Excluded values for ${fieldKey} field are from ${updatedMinExclusive} to ${updatedMaxExclusive}!`
              );
            }
          }

          if (min_length && !max_length) {
            if (value?.toString().length < min_length) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Min length for ${fieldKey} field is ${min_length}!`
              );
            }
          }

          if (max_length && !min_length) {
            if (value?.toString().length > max_length) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Max length for ${fieldKey} field is ${max_length}!`
              );
            }
          }

          if (max_length && min_length) {
            if (
              value?.toString().length > max_length ||
              value?.toString().length < min_length
            ) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Length for ${fieldKey} field should be between ${min_length} and ${max_length}!`
              );
            }
          }

          if (fraction_digits) {
            const numberOfDecimalPlaces = value.toString().split('.')[1].length;

            if (numberOfDecimalPlaces > fraction_digits) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Max number of decimal places for ${fieldKey} is ${fraction_digits}!`
              );
            }
          }

          if (total_digits) {
            const numberWithoutSeparators = value
              .toString()
              .replace(/[^\d]/g, '');

            if (numberWithoutSeparators.length !== Number(total_digits)) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Number of digits for ${fieldKey} must be ${total_digits}!`
              );
            }
          }

          if (value && whitespace && /\s/.test(value.toString())) {
            updatedErrors = updateErrors(
              updatedErrors,
              key,
              `The ${fieldKey} field can not contain whitespace!`
            );
          }
        }
      }
    });

    setErrors(updatedErrors);
  };

  const handleSave = () => {
    setErrors(undefined);

    checkValidation();

    if (errors === undefined) {
      //console.log('Call API');
    }
  };

  const getChildComponentType = (
    child: Component,
    childIndex: number,
    types: string[]
  ) => {
    child.elements.map((element) => {
      const componentsList = components.filter(
        (_, index) => childIndex !== index
      );

      const newComponentIndex = componentsList.findIndex(
        (component) => component.type === `${element.name}Type`
      );

      const newComponent = componentsList[newComponentIndex];

      if (newComponent) {
        types.push(newComponent.type);
        return getChildComponentType(newComponent, newComponentIndex, types);
      }
    });
  };

  const isChildOfExcluded = (componentType: string) => {
    const typesForExclusion: string[] = [];

    const excludedComponents = components.filter(({ type }) =>
      excluded.includes(type)
    );
    const excludedComponentIndexes = components
      .filter((_, index) =>
        excludedComponents.some((_, excludedIndex) => excludedIndex === index)
      )
      .map((_, index) => index);

    excludedComponents.forEach((excludedComponent, excludedComponentIndex) => {
      getChildComponentType(
        excludedComponent,
        excludedComponentIndexes[excludedComponentIndex],
        typesForExclusion
      );
    });

    return typesForExclusion.includes(componentType);
  };

  const generateEInvoiceUI = async (components: Component[]) => {
    payloadKeys = [];

    if (!components.length) {
      return <></>;
    }

    const invoiceComponents = components.map((component, index) => {
      const isAlreadyRendered = components
        .filter((_, currentIndex) => currentIndex < index)
        .some((currentComponent) =>
          currentComponent.elements.some(
            (element) => element.base_type === component.type
          )
        );

      const shouldBeExcluded =
        excluded.includes(component.type) || isChildOfExcluded(component.type);

      if ((index === 0 || !isAlreadyRendered) && !shouldBeExcluded) {
        return renderComponent(
          component,
          index,
          component.type,
          component.type
        );
      }
    });

    return invoiceComponents.filter((currentComponent) => currentComponent);
  };

  useEffect(() => {
    if (country) {
      fetch(
        new URL(
          `/src/resources/e-invoice/${country}/${country}.json`,
          import.meta.url
        ).href
      )
        .then((response) => response.json())
        .then((response: Resource) => {
          setIsInitial(true);
          setEInvoice(undefined);
          setRules(response.rules);
          setCurrentAvailableTypes([]);
          setExcluded(response.excluded);
          setComponents(response.components);
          setDefaultFields(response.defaultFields);
          setErrors(undefined);
          payloadKeys = [];
          availableTypes = [];
        });
    } else {
      setRules([]);
      setComponents([]);
      setErrors(undefined);
      setEInvoice(undefined);
      setIsInitial(true);
      setDefaultFields({});
      setCurrentAvailableTypes([]);
      availableTypes = [];
      payloadKeys = [];
    }
  }, [country]);

  useEffect(() => {
    if (components.length) {
      (async () => {
        const invoiceUI = await generateEInvoiceUI(components);

        isInitial && setIsInitial(false);

        setEInvoice(invoiceUI);
        isInitial && createPayload();
        isInitial && setCurrentAvailableTypes([...availableTypes]);
      })();
    }
  }, [components, currentAvailableTypes, errors, payload]);

  useEffect(() => {
    if (!isInitial) {
      setErrors(undefined);
    }
  }, [payload, currentAvailableTypes]);

  return (
    <div className="flex flex-col mt-5">
      {Boolean(eInvoice) && (
        <Element leftSide={t('fields')}>
          <SearchableSelect
            value=""
            onValueChange={(value) =>
              setCurrentAvailableTypes((current) =>
                current.filter(
                  (type) =>
                    !isChoiceFromSameGroup(value, type.key) &&
                    type.key !== value
                )
              )
            }
            clearAfterSelection
          >
            {currentAvailableTypes.map((type, index) => (
              <option key={index} value={type.key}>
                <div>
                  {reactStringReplace(type.label, type.fieldName, (match) => (
                    <strong>{match}</strong>
                  ))}
                </div>
              </option>
            ))}
          </SearchableSelect>
        </Element>
      )}

      <div className="mt-4">{eInvoice ?? null}</div>

      {Boolean(eInvoice) && (
        <Button
          className="self-end mt-4"
          behavior="button"
          onClick={handleSave}
        >
          {t('save')}
        </Button>
      )}
    </div>
  );
}
