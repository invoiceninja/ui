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
import { set } from 'lodash';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';

export type Country = 'italy';

type Payload = Record<string, string | number>;

interface PayloadKey {
  key: string;
  valueType: 'string' | 'number';
}

interface AvailableGroup {
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
  visibility: 0 | 1 | 2 | 4 | 6 | 7;
}

interface Component {
  type: string;
  help: string;
  choices: string[][];
  elements: Record<string, ElementType>;
}

interface Props {
  country: Country | undefined;
  entityLevel?: boolean;
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

  const { country, entityLevel } = props;

  const { isCompanySettingsActive, isClientSettingsActive } =
    useCurrentSettingsLevel();

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
  let availableGroups: AvailableGroup[] = [];

  const [payload, setPayload] = useState<Payload>({});
  const [currentAvailableGroups, setCurrentAvailableGroups] = useState<
    AvailableGroup[]
  >([]);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

  const getComponentKey = (label: string | null) => {
    return label?.split('Type')[0];
  };

  const handleChange = (property: string, value: string | number) => {
    setPayload((current) => ({ ...current, [property]: value }));
  };

  const isFieldChoice = (fieldKey: string) => {
    const keysLength = fieldKey.split('|').length;
    if (keysLength > 1) {
      const parentComponentType = fieldKey.split('|')[keysLength - 2];

      const fieldName = fieldKey.split('|')[keysLength - 1];

      const parentComponent = components[parentComponentType];

      if (parentComponent && fieldName) {
        return parentComponent?.choices.some((choiceGroup) =>
          choiceGroup.some((choice) => choice === fieldName)
        );
      }
    }

    return false;
  };

  const isChoiceSelected = (fieldKey: string) => {
    return Boolean(selectedChoices.find((choiceKey) => choiceKey === fieldKey));
  };

  const showField = (key: string, visibility: number) => {
    // 1, 2, 4; all levels active

    // 1;  company level active //done

    // 2;  client level only //done

    // 4;  entity level only //done

    // 1, 2;  company and client levels //done

    // 1, 4;  company and entity levels //done

    // 2, 4;  client and entity levels //done

    if (!visibility) {
      return false;
    }

    if (visibility === 1 && !isCompanySettingsActive) {
      return false;
    }

    if (visibility === 2 && !isClientSettingsActive) {
      return false;
    }

    if (visibility === 4 && !entityLevel) {
      return false;
    }

    if (
      visibility === 3 &&
      !isClientSettingsActive &&
      !isCompanySettingsActive
    ) {
      return false;
    }

    if (visibility === 5 && !entityLevel && !isCompanySettingsActive) {
      return false;
    }

    if (visibility === 6 && !entityLevel && !isClientSettingsActive) {
      return false;
    }

    const keysLength = key.split('|').length;

    const parentsKey = key
      .split('|')
      .filter((_, index) => index !== keysLength - 1)
      .join('|');

    if (
      key ===
      'FatturaElettronica|FatturaElettronicaBody|DatiGenerali|DatiFattureCollegate|DatiDocumentiCorrelatiType|CodiceCUP'
    ) {
      console.log(
        isInitial
          ? !availableGroups.find(
              (currentType) => parentsKey === currentType.key
            )
          : !currentAvailableGroups.find(
              (currentType) => parentsKey === currentType.key
            )
      );
    }

    if (isFieldChoice(key)) {
      return isChoiceSelected(key);
    }

    return isInitial
      ? !availableGroups.find((currentType) => parentsKey === currentType.key)
      : !currentAvailableGroups.find(
          (currentType) => parentsKey === currentType.key
        );
  };

  const handleDeleteComponent = (componentKey: string) => {
    const keysLength = componentKey.split('|').length;

    console.log(componentKey);

    const topParentComponentKey = getComponentKey(
      componentKey.split('|')[keysLength - 3]
    );
    const parentComponentKey = getComponentKey(
      componentKey.split('|')[keysLength - 1]
    );
    const parentName = getComponentKey(componentKey.split('|')[keysLength - 2]);

    const label = `${parentComponentKey} (${parentName}, ${topParentComponentKey})`;

    setCurrentAvailableGroups((current) => [
      ...current,
      {
        key: componentKey,
        label,
      },
    ]);

    let updatedPartOfPayload = {};

    Object.keys(payload)
      .filter((key) => key.startsWith(componentKey))
      .forEach((currentKey) => {
        updatedPartOfPayload = {
          ...updatedPartOfPayload,
          [currentKey]: typeof payload[currentKey] === 'number' ? 0 : '',
        };
      });

    setPayload((current) => ({
      ...current,
      ...updatedPartOfPayload,
    }));
  };

  const getFieldLabel = (
    fieldElement: ElementType,
    fieldParentKeys: string
  ) => {
    const parentKeysLength = fieldParentKeys.split('|').length;

    let topParentType = '';
    let lastParentType = '';

    if (parentKeysLength > 3) {
      topParentType = fieldParentKeys.split('|')[parentKeysLength - 4];
      lastParentType = fieldParentKeys.split('|')[parentKeysLength - 2];

      return `${fieldElement.name} (${getComponentKey(
        topParentType
      )}, ${getComponentKey(lastParentType)})`;
    }

    if (parentKeysLength > 2) {
      topParentType = fieldParentKeys.split('|')[parentKeysLength - 3];
      lastParentType = fieldParentKeys.split('|')[parentKeysLength - 2];

      return `${fieldElement.name} (${getComponentKey(
        topParentType
      )}, ${getComponentKey(lastParentType)})`;
    }

    if (parentKeysLength > 1) {
      lastParentType = fieldParentKeys.split('|')[parentKeysLength - 2];

      return `${fieldElement.name} (${getComponentKey(lastParentType)})`;
    }

    return fieldElement.name;
  };

  const renderElement = (element: ElementType, parentsKey: string) => {
    let leftSideLabel = '';
    const fieldKey = `${parentsKey}|${element.name || ''}`;
    const rule = rules.find((rule) => rule.key === element.name);

    if (rule) {
      leftSideLabel = rule.label;
    } else {
      leftSideLabel = getFieldLabel(element, parentsKey);
    }

    const isNumberTypeField =
      element.base_type === 'decimal' || element.base_type === 'number';

    payloadKeys.push({
      key: fieldKey,
      valueType: isNumberTypeField ? 'number' : 'string',
    });

    if (!showField(fieldKey, element.visibility)) {
      return null;
    }

    if (
      typeof element.resource === 'object' &&
      element.resource !== null &&
      Object.keys(element.resource).length
    ) {
      return (
        <Element
          key={fieldKey}
          required={rule?.required}
          leftSide={leftSideLabel}
        >
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
        <Element
          key={fieldKey}
          required={rule?.required}
          leftSide={leftSideLabel}
        >
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
        <Element
          key={fieldKey}
          required={rule?.required}
          leftSide={leftSideLabel}
        >
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
        <Element
          key={fieldKey}
          required={rule?.required}
          leftSide={leftSideLabel}
        >
          <InputField
            value={payload[fieldKey] || ''}
            onValueChange={(value) => handleChange(fieldKey, value)}
            errorMessage={errors?.errors[fieldKey]}
          />
        </Element>
      );
    }
  };

  const isComponentLastParent = (component: Component) => {
    return (
      Object.keys(component.elements).length &&
      Object.values(component.elements).some(
        ({ base_type }) => !base_type?.endsWith('Type')
      )
    );
  };

  const getChoiceSelectorLabel = (componentKey: string) => {
    const keysLength = componentKey.split('|').length;

    let lastParentType = '';
    let lastParentName = '';

    if (keysLength > 2) {
      lastParentType = componentKey.split('|')[keysLength - 3];
      lastParentName = componentKey.split('|')[keysLength - 2];
    }

    if (keysLength > 3) {
      lastParentType = componentKey.split('|')[keysLength - 4];
    }

    if (keysLength > 2 || keysLength > 3) {
      return `${t('Choices')} (${getComponentKey(
        lastParentType
      )}, ${lastParentName})`;
    }

    if (keysLength > 1) {
      lastParentName = componentKey.split('|')[keysLength - 2];

      return `${t('Choices')} (${lastParentName})`;
    }

    return t('Choices');
  };

  const shouldAnyElementBeVisible = (groupComponent: Component) => {
    const groupElements: ElementType[] = getGroupElements(groupComponent, []);

    if (groupComponent.type === 'DatiDocumentiCorrelatiType') {
      console.log(
        getFieldKeyFromPayload(groupComponent, groupElements[5].name)
      );
    }

    return groupElements.some((element) =>
      showField(
        getFieldKeyFromPayload(groupComponent, element.name),
        element.visibility
      )
    );
  };

  const renderComponent = (
    component: Component,
    componentIndex: number,
    isDefaultComponent: boolean,
    componentPath: string
  ) => {
    const isCurrentComponentLastParent = isComponentLastParent(component);

    const componentKey = `${componentPath}|${component.type}`;

    const isAnyElementFromGroupVisible = shouldAnyElementBeVisible(component);

    const shouldBeRendered = isInitial
      ? !availableGroups.some((currentType) => currentType.key === componentKey)
      : !currentAvailableGroups.find(
          (currentType) => currentType.key === componentKey
        ) && isAnyElementFromGroupVisible;

    return (
      <Container
        className="flex items-center"
        key={componentPath}
        renderFragment={!isCurrentComponentLastParent || !shouldBeRendered}
      >
        <Container
          className="flex flex-1 flex-col"
          renderFragment={!isCurrentComponentLastParent || !shouldBeRendered}
        >
          {isCurrentComponentLastParent &&
            shouldBeRendered &&
            Boolean(component.choices.length) && (
              <Element
                key={`${componentKey}ChoiceSelector`}
                leftSide={getChoiceSelectorLabel(componentKey)}
              >
                <SelectField
                  defaultValue=""
                  onValueChange={(value) => {
                    setSelectedChoices((current) => {
                      const updatedCurrentList = current.filter(
                        (choice) => !choice.startsWith(componentKey)
                      );

                      return [
                        ...updatedCurrentList,
                        ...(value ? [`${componentKey}|${value}`] : []),
                      ];
                    });
                  }}
                  withBlank
                >
                  {component.choices.map((choiceGroup) =>
                    choiceGroup.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))
                  )}
                </SelectField>
              </Element>
            )}

          {Boolean(Object.keys(component.elements).length) &&
            Object.values(component.elements).map((element) => {
              if (element.base_type?.endsWith('Type')) {
                const componentsList = Object.values(components).filter(
                  (_, index) => componentIndex !== index
                );

                const nextComponentIndex = componentsList.findIndex(
                  (component) => component.type === element.base_type
                );

                const nextComponent = componentsList[nextComponentIndex];

                if (nextComponent) {
                  const isNewComponentLastParent =
                    isComponentLastParent(nextComponent);

                  const isNewComponentDefault = element.min_occurs !== 0;

                  const isAnyElementFromGroupVisible =
                    shouldAnyElementBeVisible(nextComponent);

                  if (
                    isInitial &&
                    !isNewComponentDefault &&
                    isNewComponentLastParent &&
                    isAnyElementFromGroupVisible
                  ) {
                    const label = `${getComponentKey(nextComponent.type)} (${
                      element.name
                    }, ${getComponentKey(component.type)})`;

                    availableGroups.push({
                      key: `${componentPath}|${element.name}|${nextComponent.type}`,
                      label,
                    });
                  }

                  return renderComponent(
                    nextComponent,
                    nextComponentIndex,
                    Boolean(isNewComponentDefault),
                    `${componentPath}|${element.name}`
                  );
                }
              } else {
                return renderElement(element, componentKey);
              }
            })}
        </Container>

        {shouldBeRendered &&
          !isDefaultComponent &&
          isCurrentComponentLastParent && (
            <div
              className="cursor-pointer"
              onClick={() => handleDeleteComponent(componentKey)}
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
      const keysLength = key.split('|').length;

      currentPayload = {
        ...currentPayload,
        [key]:
          defaultFields[key.split('|')[keysLength - 1]] ||
          (valueType === 'number' ? 0 : ''),
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
        [key]: [
          ...(currentErrors.errors[key] ? currentErrors.errors[key] : []),
          currentErrors.errors[key]?.length ? `\n ${value}` : value,
        ],
      },
    };
  };

  const checkValidation = () => {
    let updatedErrors: ValidationBag = { errors: {}, message: '' };

    Object.entries(payload).forEach(([key, value]) => {
      const keysLength = key.split('|').length;
      const fieldKey = key.split('|')[keysLength - 1];

      let field: ElementType | undefined;

      Object.values(components).forEach((component) => {
        if (!field) {
          field = Object.values(component.elements).find(
            ({ name }) => name === fieldKey
          );
        }
      });

      if (showField(key, field?.visibility || 0)) {
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

          if (pattern) {
            try {
              const isPatternFailed =
                new RegExp(pattern).test(value.toString()) === false;

              if (isPatternFailed) {
                updatedErrors = updateErrors(
                  updatedErrors,
                  key,
                  `${fieldKey} has wrong pattern, the correct pattern is ${new RandExp(
                    pattern as string
                  ).gen()} (example)!`
                );
              }
            } catch (error) {
              console.error(error);
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
              (value?.toString().length > max_length ||
                value?.toString().length < min_length) &&
              max_length !== min_length
            ) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Length for ${fieldKey} field should be between ${min_length} and ${max_length}!`
              );
            } else if (
              value?.toString().length > max_length ||
              value?.toString().length < min_length
            ) {
              updatedErrors = updateErrors(
                updatedErrors,
                key,
                `Length for ${fieldKey} field should be ${min_length}!`
              );
            }
          }
        }
      }
    });

    setErrors(updatedErrors);
  };

  const formatPayload = () => {
    const formattedPayload = {};

    Object.entries(payload).forEach(([key, value]) => {
      const prefix = `${key.split('|')[0]}|`;
      const path = key.split(prefix)[1];

      set(formattedPayload, path.replaceAll('|', '.'), value);
    });

    console.log(JSON.stringify(formattedPayload));
  };

  const handleSave = () => {
    setErrors(undefined);

    checkValidation();

    formatPayload();

    if (errors === undefined) {
      //console.log('Call API');
    }
  };

  const getGroupElements = (
    component: Component,
    currentElements: ElementType[]
  ): ElementType[] => {
    const elements = Object.values(component.elements);

    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];

      if (element.base_type?.endsWith('Type')) {
        return getGroupElements(components[element.base_type], currentElements);
      } else {
        currentElements.push(element);
      }
    }

    return currentElements;
  };

  const getFieldKeyFromPayload = (
    parentComponent: Component,
    fieldName: string
  ) => {
    let fieldKey = '';

    Object.keys(payload).forEach((key) => {
      if (
        !fieldKey &&
        key.includes(parentComponent.type) &&
        key.includes(fieldName)
      ) {
        fieldKey = key;
      }
    });

    return fieldKey;
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
          const isLastParent = isComponentLastParent(component);

          return renderComponent(
            component,
            index,
            Boolean(isLastParent),
            getComponentKey(component.type) || ''
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
          setCurrentAvailableGroups([]);
          setExcluded(response.excluded);
          setComponents(response.components);
          setDefaultFields(response.defaultFields);
          setErrors(undefined);
          setSelectedChoices([]);
          payloadKeys = [];
          availableGroups = [];
        });
    } else {
      setRules([]);
      setComponents({});
      setErrors(undefined);
      setEInvoice(undefined);
      setIsInitial(true);
      setDefaultFields({});
      setCurrentAvailableGroups([]);
      setSelectedChoices([]);
      availableGroups = [];
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

        isInitial && setCurrentAvailableGroups([...availableGroups]);
      })();
    }
  }, [components, currentAvailableGroups, errors, payload, selectedChoices]);

  useEffect(() => {
    if (!isInitial) {
      setErrors(undefined);
    }
  }, [payload, currentAvailableGroups, selectedChoices]);

  return (
    <div className="flex flex-col mt-5">
      {Boolean(eInvoice) && (
        <Element leftSide={t('fields')}>
          <SearchableSelect
            value=""
            onValueChange={(value) =>
              setCurrentAvailableGroups((current) =>
                current.filter((type) => type.key !== value)
              )
            }
            clearAfterSelection
          >
            {currentAvailableGroups.map(({ key, label }, index) => (
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
