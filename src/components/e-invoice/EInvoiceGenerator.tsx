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

export type Country = 'italy';

interface Resource {
  rules: Rule[];
  validations: Validation[];
  components: Component[];
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
  base_type: 'string' | 'decimal' | 'number';
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
  const [components, setComponents] = useState<Component[]>([]);
  const [validations, setValidation] = useState<Validation[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [payload, setPayload] = useState({});

  const getSectionLabel = (label: string) => {
    return label.split('Type')[0];
  };

  const renderElement = (component: Component) => {
    const validation = validations.find(
      (validation) => validation.name === component.type
    );

    if (validation) {
      let label = '';
      const rule = rules.find((rule) => `${rule.key}Type` === validation.name);

      if (rule) {
        label = rule.label;
      } else {
        label = getSectionLabel(validation.name);
      }

      if (
        typeof validation.resource === 'object' &&
        validation.resource !== null &&
        Object.keys(validation.resource).length
      ) {
        return (
          <div className="mt-2">
            <SelectField label={label} withBlank>
              {Object.entries(validation.resource).map(
                ([key, value], index) => (
                  <option key={index} value={key}>
                    {value || key}
                  </option>
                )
              )}
            </SelectField>
          </div>
        );
      }

      if (
        validation.base_type === 'decimal' ||
        validation.base_type === 'number'
      ) {
        return (
          <div className="mt-2">
            <InputField type="number" label={label} />
          </div>
        );
      }

      if (validation.base_type !== null) {
        return (
          <div className="mt-2">
            <InputField label={label} />
          </div>
        );
      }
    }

    return <></>;
  };

  const generateEInvoiceUI = (component: Component) => {
    if (!component) {
      return <></>;
    }

    return (
      <>
        {Boolean(component.elements.length) &&
          component.elements.map((element, index) => {
            const newComponent = components.find(
              (component) => component.type === `${element.name}Type`
            );

            if (newComponent) {
              return <div key={index}>{generateEInvoiceUI(newComponent)}</div>;
            }

            return <></>;
          })}

        {Boolean(!component.elements.length) && renderElement(component)}
      </>
    );
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
        });
    } else {
      setRules([]);
      setComponents([]);
      setValidation([]);
    }
  }, [country]);

  return (
    <div className="flex flex-col mt-5">
      {generateEInvoiceUI(components[0])}

      {Boolean(components.length) && (
        <Button className="self-end mt-4">{t('save')}</Button>
      )}
    </div>
  );
}
