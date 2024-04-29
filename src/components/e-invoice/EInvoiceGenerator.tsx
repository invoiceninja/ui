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

export type Country = 'italy';

type Payload = Record<string, string | number>;

interface PayloadKey {
  key: string;
  valueType: 'string' | 'number';
}

interface Resource {
  rules: Rule[];
  validations: Validation[];
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
  const [components, setComponents] = useState<Component[]>([]);
  const [validations, setValidation] = useState<Validation[]>([]);
  const [eInvoice, setEInvoice] = useState<JSX.Element | JSX.Element[]>();

  let payloadKeys: PayloadKey[] = [];
  const [payload, setPayload] = useState<Payload>({});

  const getSectionLabel = (label: string) => {
    return label.split('Type')[0];
  };

  const handleChange = (property: string, value: string | number) => {
    setPayload((current) => ({ ...current, [property]: value }));
  };

  const renderElement = (component: Component) => {
    const validation = validations.find(
      (validation) => validation.name === component.type
    );

    if (validation) {
      let label = '';
      const fieldKey = getSectionLabel(validation.name);
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

      if (
        typeof validation.resource === 'object' &&
        validation.resource !== null &&
        Object.keys(validation.resource).length
      ) {
        return (
          <Element leftSide={label}>
            <SelectField
              key={`${label}select`}
              defaultValue={payload[fieldKey] || ''}
              onValueChange={(value) => handleChange(fieldKey, value)}
              withBlank
            >
              {Object.entries(validation.resource).map(
                ([key, value], index) => (
                  <option key={`${label}select${index}`} value={key}>
                    {value || key}
                  </option>
                )
              )}
            </SelectField>
          </Element>
        );
      }

      if (
        validation.base_type === 'decimal' ||
        validation.base_type === 'number'
      ) {
        return (
          <Element leftSide={label}>
            <InputField
              key={`${label}number`}
              type="number"
              value={payload[fieldKey] || 0}
              onValueChange={(value) =>
                handleChange(fieldKey, parseFloat(value))
              }
            />
          </Element>
        );
      }

      if (validation.base_type === 'date') {
        return (
          <Element leftSide={label}>
            <InputField
              key={`${label}date`}
              type="date"
              value={payload[fieldKey] || ''}
              onValueChange={(value) => handleChange(fieldKey, value)}
            />
          </Element>
        );
      }

      if (validation.base_type !== null) {
        return (
          <Element leftSide={label}>
            <InputField
              key={`${label}text`}
              value={payload[fieldKey] || ''}
              onValueChange={(value) => handleChange(fieldKey, value)}
            />
          </Element>
        );
      }
    }

    return <></>;
  };

  const renderComponent = (component: Component, componentIndex: number) => {
    return (
      <div key={`${componentIndex}${component.type}renderer`}>
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
              return (
                <div key={`${newComponentIndex}${newComponent.type}`}>
                  {renderComponent(newComponent, newComponentIndex)}
                </div>
              );
            }

            return <></>;
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
        [key]: valueType === 'number' ? 0 : '',
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
        return (
          <div key={`${index}main`}>{renderComponent(component, index)}</div>
        );
      }

      return <></>;
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
          setRules(response.rules);
          setValidation(response.validations);
          setComponents(response.components);
          setExcluded(response.excluded);
        });
    } else {
      setRules([]);
      setComponents([]);
      setValidation([]);
      setEInvoice(undefined);
    }
  }, [country]);

  useEffect(() => {
    if (components.length) {
      (async () => {
        const invoiceUI = await generateEInvoiceUI(components);

        setEInvoice(invoiceUI);
      })();
    }
  }, [components]);

  return (
    <div key="parent" className="flex flex-col mt-5">
      {eInvoice ?? null}

      {Boolean(eInvoice) && (
        <Button className="self-end mt-4">{t('save')}</Button>
      )}
    </div>
  );
}
