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
  base_type: 'string';
  resource: Record<string, string>[];
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
  const { country } = props;

  const [rules, setRules] = useState<Rule[]>([]);
  const [validations, setValidation] = useState<Validation[]>([]);
  const [components, setComponents] = useState<Component[]>([]);

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

  console.log(rules, validations, components);

  return <div>EInvoiceGenerator</div>;
}
