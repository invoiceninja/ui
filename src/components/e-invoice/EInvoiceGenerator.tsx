/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { Button, InputField, SelectField } from '../forms';
import { useTranslation } from 'react-i18next';
import { Element } from '../cards';
import { v4 } from 'uuid';
import { Icon } from '../icons/Icon';
import { MdDelete } from 'react-icons/md';
import { SearchableSelect } from '../SearchableSelect';

export type Country = 'italy';

type Payload = Record<string, string | number>;

interface PayloadKey {
  key: string;
  valueType: 'string' | 'number';
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

interface Element {
  name: string;
  min: number;
  max: number;
}

interface Component {
  type: string;
  elements: Element[];
}

interface Props {
  country: Country | undefined;
}
export function EInvoiceGenerator(props: Props) {
  const [t] = useTranslation();

  const { country } = props;

  const [rules, setRules] = useState<Rule[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [isInitial, setIsInitial] = useState<boolean>(true);
  const [components, setComponents] = useState<Component[]>([]);
  const [validations, setValidation] = useState<Validation[]>([]);
  const [eInvoice, setEInvoice] = useState<JSX.Element | JSX.Element[]>();
  const [defaultFields, setDefaultFields] = useState<Record<string, string>>(
    {}
  );

  let payloadKeys: PayloadKey[] = [];
  let availableTypes: string[] = [];

  const [payload, setPayload] = useState<Payload>({});
  const [currentAvailableTypes, setCurrentAvailableTypes] = useState<string[]>(
    []
  );

  const getFieldLabel = (label: string) => {
    return label.split('Type')[0];
  };

  const handleChange = (property: string, value: string | number) => {
    setPayload((current) => ({ ...current, [property]: value }));
  };

  const showField = (type: string) => {
    return isInitial
      ? !availableTypes.find((currentType) => currentType === type)
      : !currentAvailableTypes.find((currentType) => currentType === type);
  };

  const renderElement = (component: Component) => {
    const validation = validations.find(
      (validation) => validation.name === component.type
    );

    if (validation) {
      let label = '';
      const fieldKey = getFieldLabel(validation.name);
      const rule = rules.find((rule) => `${rule.key}Type` === validation.name);

      if (rule) {
        label = rule.label;
      } else {
        label = fieldKey;
      }

      const isNumberTypeField =
        validation.base_type === 'decimal' || validation.base_type === 'number';

      payloadKeys.push({
        key: fieldKey,
        valueType: isNumberTypeField ? 'number' : 'string',
      });

      if (isInitial) {
        const isDefaultField = Object.keys(defaultFields).includes(
          component.type.split('Type')[0]
        );

        if (!isDefaultField) {
          availableTypes.push(component.type);
        }
      }

      if (!showField(component.type)) {
        return null;
      }

      if (
        typeof validation.resource === 'object' &&
        validation.resource !== null &&
        Object.keys(validation.resource).length
      ) {
        return (
          <Element required={rule?.required} leftSide={label}>
            <div className="flex items-center w-full space-x-3">
              <div className="flex-1">
                <SelectField
                  defaultValue={payload[fieldKey] || ''}
                  onValueChange={(value) => handleChange(fieldKey, value)}
                  withBlank
                >
                  {Object.entries(validation.resource).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value || key}
                    </option>
                  ))}
                </SelectField>
              </div>

              {!rule?.required && (
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentAvailableTypes((current) => [
                      ...current,
                      component.type,
                    ])
                  }
                >
                  <Icon element={MdDelete} size={28} />
                </div>
              )}
            </div>
          </Element>
        );
      }

      if (
        validation.base_type === 'decimal' ||
        validation.base_type === 'number'
      ) {
        return (
          <Element required={rule?.required} leftSide={label}>
            <div className="flex items-center w-full space-x-3">
              <div className="flex-1">
                <InputField
                  type="number"
                  value={payload[fieldKey] || 0}
                  onValueChange={(value) =>
                    handleChange(fieldKey, parseFloat(value))
                  }
                />
              </div>

              {!rule?.required && (
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentAvailableTypes((current) => [
                      ...current,
                      component.type,
                    ])
                  }
                >
                  <Icon element={MdDelete} size={28} />
                </div>
              )}
            </div>
          </Element>
        );
      }

      if (validation.base_type === 'date') {
        return (
          <Element required={rule?.required} leftSide={label}>
            <div className="flex items-center w-full space-x-3">
              <div className="flex-1">
                <InputField
                  type="date"
                  value={payload[fieldKey] || ''}
                  onValueChange={(value) => handleChange(fieldKey, value)}
                />
              </div>

              {!rule?.required && (
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentAvailableTypes((current) => [
                      ...current,
                      component.type,
                    ])
                  }
                >
                  <Icon element={MdDelete} size={28} />
                </div>
              )}
            </div>
          </Element>
        );
      }

      if (validation.base_type !== null) {
        return (
          <Element required={rule?.required} leftSide={label}>
            <div className="flex items-center w-full space-x-3">
              <div className="flex-1">
                <InputField
                  value={payload[fieldKey] || ''}
                  onValueChange={(value) => handleChange(fieldKey, value)}
                />
              </div>

              {!rule?.required && (
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentAvailableTypes((current) => [
                      ...current,
                      component.type,
                    ])
                  }
                >
                  <Icon element={MdDelete} size={28} />
                </div>
              )}
            </div>
          </Element>
        );
      }
    }

    return <div key={v4()}></div>;
  };

  const renderComponent = (component: Component, componentIndex: number) => {
    return (
      <div key={v4()}>
        {Boolean(component.elements.length) &&
          component.elements.map((element) => {
            const componentsList = components.filter(
              (_, index) => componentIndex !== index
            );

            const newComponentIndex = componentsList.findIndex(
              (component) => component.type === `${element.name}Type`
            );

            const newComponent = componentsList[newComponentIndex];

            if (newComponent) {
              return renderComponent({ ...newComponent }, newComponentIndex);
            }

            return <div key={v4()}></div>;
          })}

        {Boolean(!component.elements.length) && renderElement(component)}
      </div>
    );
  };

  const createPayload = () => {
    let currentPayload: Payload = {};

    payloadKeys.forEach(({ key, valueType }) => {
      currentPayload = {
        ...currentPayload,
        [key]: defaultFields[key] || (valueType === 'number' ? 0 : ''),
      };
    });

    setPayload(currentPayload);
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
            (element) => `${element.name}Type` === component.type
          )
        );

      const shouldBeExcluded =
        excluded.includes(component.type) || isChildOfExcluded(component.type);

      if ((index === 0 || !isAlreadyRendered) && !shouldBeExcluded) {
        return renderComponent(component, index);
      }

      return <div key={v4()}></div>;
    });

    createPayload();

    return invoiceComponents;
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
          setValidation(response.validations);
          setComponents(response.components);
          setDefaultFields(response.defaultFields);
          payloadKeys = [];
          availableTypes = [];
        });
    } else {
      setRules([]);
      setComponents([]);
      setValidation([]);
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

        setIsInitial(false);
        setEInvoice(invoiceUI);
        isInitial && setCurrentAvailableTypes([...availableTypes]);
      })();
    }
  }, [components, currentAvailableTypes]);

  return (
    <div className="flex flex-col mt-5">
      {Boolean(eInvoice) && (
        <Element leftSide={t('fields')}>
          <SearchableSelect
            value=""
            onValueChange={(value) =>
              setCurrentAvailableTypes((current) =>
                current.filter((type) => type !== value)
              )
            }
            clearAfterSelection
          >
            <option value=""></option>

            {currentAvailableTypes.map((type, index) => (
              <option key={index} value={type}>
                {getFieldLabel(type)}
              </option>
            ))}
          </SearchableSelect>
        </Element>
      )}

      <div className="mt-4">{eInvoice ?? null}</div>

      {Boolean(eInvoice) && (
        <Button className="self-end mt-4">{t('save')}</Button>
      )}
    </div>
  );
}
