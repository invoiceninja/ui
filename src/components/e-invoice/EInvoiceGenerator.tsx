/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { Button, InputField, SelectField } from '../forms';
import { useTranslation } from 'react-i18next';
import { Element } from '../cards';
import { Icon } from '../icons/Icon';
import { MdDelete } from 'react-icons/md';
import { SearchableSelect } from '../SearchableSelect';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import RandExp from 'randexp';

export type Country = 'italy';

type Payload = Record<string, string | number>;

interface PayloadKey {
  key: string;
  valueType: 'string' | 'number';
}

interface AvailableType {
  key: string;
  label: string;
}

interface Resource {
  rules: Rule[];
  validations: Validation[];
  defaultFields: Record<string, string>;
  components: Record<string, Component>;
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
  max_length: number | null;
  min_length: number | null;
  pattern: string | null;
  help: string;
  min_occurs: number;
  max_occurs: number;
}

interface Component {
  type: string;
  help: string;
  choices: string[][];
  elements: Record<string, ElementType>;
}

interface Props {
  country: Country | undefined;
}

interface ContainerProps {
  renderFragment: boolean;
  children: ReactNode;
  className: string;
}

function Container(props: ContainerProps) {
  const { renderFragment, children, className } = props;

  if (renderFragment) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return <div className={className}>{children}</div>;
}

export function EInvoiceGenerator(props: Props) {
  const [t] = useTranslation();

  const { country } = props;

  const [rules, setRules] = useState<Rule[]>([]);
  const [errors, setErrors] = useState<ValidationBag>();
  const [excluded, setExcluded] = useState<string[]>([]);
  const [isInitial, setIsInitial] = useState<boolean>(true);
  const [components, setComponents] = useState<Record<string, Component>>({});
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

  const getComponentKey = (label: string | null) => {
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

    const topParentComponent = Object.values(components).find(
      ({ type }) => type === topParentType
    );
    const choiceTopParentElementType = Object.values(
      topParentComponent?.elements || {}
    ).find(({ name }) => name === parentElementName)?.base_type;

    const choiceParentComponent = Object.values(components).find(
      ({ type }) => type === choiceTopParentElementType
    );

    const choiceGroup = choiceParentComponent?.choices.find((choiceGroup) =>
      choiceGroup.includes(elementName)
    );

    return choiceGroup?.includes(comparingElementName);
  };

  const isChildOfTheComponent = (fieldKey: string, componentKey: string) => {
    const parentComponentType = componentKey.split('|')[1];

    const currentFieldName = fieldKey.split('|')[2];

    const parentComponent = components[parentComponentType];

    if (parentComponent && currentFieldName) {
      return parentComponent.elements[currentFieldName];
    }

    return false;
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
      ? !availableTypes.some((currentType) =>
          isChildOfTheComponent(key, currentType.key)
        )
      : !currentAvailableTypes.find((currentType) =>
          isChildOfTheComponent(key, currentType.key)
        );
  };

  const handleDeleteField = (componentKey: string) => {
    const currentType = payloadKeys.find(({ key }) => key === componentKey);

    if (currentType) {
      setCurrentAvailableTypes((current) => [
        ...current,
        {
          key: currentType.key,
          label: 'asdasd',
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
      const topParentType = `${parentsKey.split('|')[0]}Type`;
      const parentElementName = parentsKey.split('|')[1];

      const topParentComponent = Object.values(components).find(
        ({ type }) => type === topParentType
      );
      const choiceTopParentElementType = Object.values(
        topParentComponent?.elements || {}
      ).find(({ name }) => name === parentElementName)?.base_type;

      const choiceParentComponent = Object.values(components).find(
        ({ type }) => type === choiceTopParentElementType
      );

      return choiceParentComponent?.choices.some((choiceGroup) =>
        choiceGroup.some((choice) => choice === elementName)
      );
    }

    return false;
  };

  const renderElement = (element: ElementType, parentsKey: string) => {
    let leftSideLabel = '';
    const fieldKey = `${parentsKey}|${element.name || ''}`;
    const rule = rules.find((rule) => rule.key === element.name);

    if (rule) {
      leftSideLabel = rule.label;
    } else {
      leftSideLabel = `${element.name} (${parentsKey.split('|')[0]}, ${
        parentsKey.split('|')[1]
      })`;
    }

    const isNumberTypeField =
      element.base_type === 'decimal' || element.base_type === 'number';

    payloadKeys.push({
      key: fieldKey,
      valueType: isNumberTypeField ? 'number' : 'string',
    });

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
        </Element>
      );
    }

    if (element.base_type === 'decimal' || element.base_type === 'number') {
      return (
        <Element required={rule?.required} leftSide={leftSideLabel}>
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
        </Element>
      );
    }

    if (element.base_type === 'date') {
      return (
        <Element required={rule?.required} leftSide={leftSideLabel}>
          <InputField
            type="date"
            value={payload[fieldKey] || ''}
            onValueChange={(value) => handleChange(fieldKey, value)}
            errorMessage={errors?.errors[fieldKey]}
          />
        </Element>
      );
    }

    if (element.base_type !== null) {
      return (
        <Element required={rule?.required} leftSide={leftSideLabel}>
          <InputField
            value={payload[fieldKey] || ''}
            onValueChange={(value) => handleChange(fieldKey, value)}
            errorMessage={errors?.errors[fieldKey]}
          />
        </Element>
      );
    }
  };

  const renderComponent = (
    component: Component,
    componentIndex: number,
    topParentType: string,
    lastParentType: string,
    lastParentName: string,
    isDefaultComponent: boolean
  ) => {
    const isCurrentComponentLastParent =
      Object.keys(component.elements).length &&
      Object.values(component.elements).some(
        ({ base_type }) => !base_type?.endsWith('Type')
      );

    const shouldBeRendered = isInitial
      ? !availableTypes.some(
          (currentType) =>
            currentType.key === `${topParentType}|${component.type}`
        )
      : !currentAvailableTypes.find(
          (currentType) =>
            currentType.key === `${topParentType}|${component.type}`
        );

    return (
      <Container
        className="flex items-center"
        key={`${topParentType}${lastParentType}${lastParentName}`}
        renderFragment={!isCurrentComponentLastParent || !shouldBeRendered}
      >
        <Container
          className="flex flex-1 flex-col"
          renderFragment={!isCurrentComponentLastParent || !shouldBeRendered}
        >
          {Boolean(Object.keys(component.elements).length) &&
            Object.values(component.elements).map((element) => {
              if (element.base_type?.endsWith('Type')) {
                const componentsList = Object.values(components).filter(
                  (_, index) => componentIndex !== index
                );

                const newComponentIndex = componentsList.findIndex(
                  (component) => component.type === element.base_type
                );

                const newComponent = componentsList[newComponentIndex];

                if (newComponent) {
                  const isCurrentComponentLastParent =
                    Object.keys(component.elements).length &&
                    Object.values(component.elements).some(
                      ({ base_type }) => !base_type?.endsWith('Type')
                    );
                  const isNewComponentLastParent =
                    Object.keys(newComponent.elements).length &&
                    Object.values(newComponent.elements).some(
                      ({ base_type }) => !base_type?.endsWith('Type')
                    );

                  const label = `${getComponentKey(newComponent.type)} (${
                    element.name
                  }, ${getComponentKey(component.type || '')})`;

                  const isCurrentDefaultComponent = element.min_occurs !== 0;

                  if (!isCurrentComponentLastParent) {
                    console.log(component.type);
                  }

                  if (
                    isInitial &&
                    !isCurrentDefaultComponent &&
                    isNewComponentLastParent &&
                    !isCurrentComponentLastParent
                  ) {
                    availableTypes.push({
                      key: `${topParentType}|${newComponent.type}`,
                      label,
                    });
                  }

                  return renderComponent(
                    { ...newComponent },
                    newComponentIndex,
                    !isNewComponentLastParent
                      ? newComponent.type
                      : topParentType,
                    component.type,
                    element.name,
                    Boolean(isCurrentDefaultComponent)
                  );
                }
              } else {
                return renderElement(
                  element,
                  `${getComponentKey(topParentType)}|${lastParentName}`
                );
              }
            })}
        </Container>

        {shouldBeRendered &&
          !isDefaultComponent &&
          isCurrentComponentLastParent && (
            <div
              className="cursor-pointer"
              onClick={() =>
                handleDeleteField(`${topParentType}|${component.type}`)
              }
            >
              <Icon element={MdDelete} size={28} />
            </div>
          )}
      </Container>
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

        Object.values(components).forEach((component) => {
          if (!fieldValidation) {
            fieldValidation = Object.values(component.elements).find(
              ({ name }) => name === fieldKey
            );
          }
        });

        const isRequired = rules.find(
          (rule) => rule.key === fieldKey
        )?.required;

        if (fieldValidation) {
          const { pattern, length, min_length, max_length } = fieldValidation;

          if (isRequired && !value) {
            updatedErrors = updateErrors(
              updatedErrors,
              key,
              `${key} is required field!`
            );
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
    Object.values(child.elements).map((element) => {
      const componentsList = Object.values(components).filter(
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

    const excludedComponents = Object.values(components).filter(({ type }) =>
      excluded.includes(type)
    );
    const excludedComponentIndexes = Object.values(components)
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

  const generateEInvoiceUI = async (components: Record<string, Component>) => {
    payloadKeys = [];

    if (!Object.keys(components).length) {
      return <></>;
    }

    const invoiceComponents = Object.values(components).map(
      (component, index) => {
        const isAlreadyRendered = Object.values(components)
          .filter((_, currentIndex) => currentIndex < index)
          .some((currentComponent) =>
            Object.values(currentComponent.elements).some(
              (element) => element.base_type === component.type
            )
          );

        const shouldBeExcluded =
          excluded.includes(component.type) ||
          isChildOfExcluded(component.type);

        if ((index === 0 || !isAlreadyRendered) && !shouldBeExcluded) {
          const isLastParent =
            Object.keys(component.elements).length &&
            Object.values(component.elements).some(
              ({ base_type }) => !base_type?.endsWith('Type')
            );

          return renderComponent(
            component,
            index,
            component.type,
            component.type,
            component.type,
            Boolean(isLastParent)
          );
        }
      }
    );

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
      setComponents({});
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
    if (Object.keys(components).length) {
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
            {currentAvailableTypes.map(({ key, label }, index) => (
              <option key={index} value={key}>
                {label}
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
