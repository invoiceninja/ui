/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { useLogo } from '$app/common/hooks/useLogo';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import { useDispatch } from 'react-redux';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import template from './static/example-template.txt?raw'

interface Element {
  selector: string;
  value: string | null;
  property: string;
  metadata: {
    companyProperty?: string;
    magicVariable?: string;
  };
}

interface Compilation {
  html: string;
}

class Builder {
  #document!: Document;
  #css = new CSSStyleSheet();

  constructor(public html: string) {
    this.#document = new DOMParser().parseFromString(html, 'text/html');

    const style = this.#document.querySelector('style');

    if (style) {
      this.#css.replaceSync(style.innerHTML);
    }
  }

  sync(options: { elements: Element[]; magicVariables: boolean }) {
    options.elements.map((element) => {
      // We want directly update only elements, that are not linked to company settings.
      // Example of this is primary color, font, etc.
      // Anything that can be edited using panel & it's not directly linked to the template itself.
      const value =
        element.metadata.magicVariable && options.magicVariables
          ? element.metadata.magicVariable
          : element.value;

      this.setSelectorValue(element.selector, element.property, value);
    });

    return this;
  }

  #querySelector(selector: string) {
    const numbers = [...Array(this.#css.cssRules.length).keys()];
    let cssRule: CSSStyleRule | undefined;

    numbers.map((i) => {
      const rule = this.#css.cssRules.item(i) as CSSStyleRule | null;

      if (rule && rule.selectorText === selector) {
        cssRule = this.#css.cssRules.item(i) as CSSStyleRule;

        return false;
      }
    });

    return cssRule ?? null;
  }

  #html(): string {
    const cssTexts: string[] = [];
    const numbers = [...Array(this.#css.cssRules.length).keys()];

    numbers.forEach((number) => {
      const rule = this.#css.cssRules.item(number);

      rule && cssTexts.push(rule.cssText);
    });

    this.#document.querySelector('style')!.innerHTML = cssTexts.join('\n');

    return this.#document.documentElement.innerHTML;
  }

  getSelectorValue(selector: string, property: string) {
    return (
      this.#querySelector(selector)?.style.getPropertyValue(property) || null
    );
  }

  setSelectorValue(
    selector: string,
    property: string,
    value: string | null
  ): Builder {
    this.#querySelector(selector)?.style.setProperty(property, value);

    return this;
  }

  compile() {
    return {
      html: this.#html(),
    } satisfies Compilation;
  }
}

interface ElementUtilitiesOptions {
  elements: Element[];
  setElements: Dispatch<SetStateAction<Element[]>>;
}

function useElementUtilities({
  elements,
  setElements,
}: ElementUtilitiesOptions) {
  const dispatch = useDispatch();

  const getSelectorValue = (selector: string, property: string) => {
    const element = elements.find(
      (e) => e.selector === selector && e.property === property
    );

    if (element) {
      return element.value;
    }

    console.warn(
      `Trying to access missing selector [${selector}] with property [${property}].`
    );
  };

  const setSelectorValue = (
    selector: string,
    property: string,
    value: string
  ) => {
    const index = elements.findIndex(
      (e) => e.selector === selector && e.property === property
    );

    const element = elements[index];

    if (index) {
      setElements((current) => {
        const elements: Element[] = [...current];

        elements[index].value = value;

        return elements;
      });
    }

    if (element.metadata.companyProperty) {
      dispatch(
        updateChanges({
          object: 'company',
          property: element.metadata.companyProperty,
          value: value,
        })
      );
    }
  };

  return { getSelectorValue, setSelectorValue };
}

function useElements() {
  const [elements, setElements] = useState<Element[]>([]);

  const company = useInjectCompanyChanges();

  const { getSelectorValue, setSelectorValue } = useElementUtilities({
    elements,
    setElements,
  });

  useEffect(() => {
    company &&
      setElements([
        {
          selector: ':root',
          property: '--primary-color',
          value: company.settings.primary_color,
          metadata: {
            companyProperty: 'settings.primary_color',
            magicVariable: '$primary_color',
          },
        },
        {
          selector: ':root',
          property: '--secondary-color',
          value: company.settings.secondary_color,
          metadata: {
            companyProperty: 'settings.secondary_color',
            magicVariable: '$secondary_color',
          },
        },
        {
          selector: '.company-logo',
          property: 'max-width',
          value: getSelectorValue('.company-logo', 'max-width') || '65%',
          metadata: {},
        },
      ]);
  }, [company?.settings]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('designer.data', {
        detail: elements,
      })
    );
  }, [elements]);

  return { elements, getSelectorValue, setSelectorValue };
}

function useBuilder() {
  const builder = new Builder(template);

  const [elements, setElements] = useState<Element[]>([]);
  const [html, setHtml] = useState<string>();

  useEffect(() => {
    window.addEventListener('designer.data', (payload: any) => {
      const e: Element[] = payload.detail;

      setElements(e);

      const { html } = builder
        .sync({ elements: e, magicVariables: false })
        .compile();

      setHtml(html);
    });
  }, []);

  const build = () => {
    const artifacts = builder
      .sync({ elements, magicVariables: true })
      .compile();

    console.log('Output', artifacts.html);

    builder.sync({ elements, magicVariables: false }).compile();
  };

  return { html, build };
}

export function Designer() {
  const logo = useLogo();

  const { html, build } = useBuilder();
  const { getSelectorValue, setSelectorValue } = useElements();

  return (
    <div className="flex">
      <div className="h-screen w-1/3 bg-gray-100">
        <div className="flex flex-col p-6">
          <div>
            <button onClick={build}>Export</button>
          </div>

          <Link className="inline-flex items-center space-x-1" to="/settings">
            <ArrowLeft size={16} />
            <span>Back to settings</span>
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-gray-200">
          <div className="px-6 py-4">
            <h4 className="uppercase font-semibold">Company logo</h4>
            <p className="text-xs">Change company logo and adjust the size</p>

            <div className="flex flex-col space-y-2 my-4">
              <small className="font-medium">Logo</small>

              <div className="grid grid-cols-12 lg:gap-4 space-y-4 lg:space-y-0">
                <div className="bg-gray-200 col-span-12 lg:col-span-5 rounded-lg p-6">
                  <img src={logo} />
                </div>
              </div>

              <label
                htmlFor="slider"
                className="inline-flex items-center space-x-2"
              >
                <input
                  type="range"
                  min="1"
                  max="65"
                  value={getSelectorValue(
                    '.company-logo',
                    'max-width'
                  )?.replace('%', '')}
                  id="slider"
                  onChange={(event) =>
                    setSelectorValue(
                      '.company-logo',
                      'max-width',
                      `${event.target.value}%`
                    )
                  }
                />
                <span className="text-sm">
                  {getSelectorValue('.company-logo', 'max-width')}
                </span>
              </label>
            </div>
          </div>

          <div className="px-6 py-4">
            <h4 className="uppercase font-semibold">Colors</h4>
            <p className="text-xs">
              Adjust primary and secondary color to match your brand
            </p>

            <div className="flex flex-col space-y-2 my-4">
              <small className="font-medium">Primary color</small>

              <ColorPicker
                value={getSelectorValue(':root', '--primary-color') || '#fff'}
                onValueChange={(value) =>
                  setSelectorValue(':root', '--primary-color', value)
                }
              />
            </div>

            <div className="flex flex-col space-y-2 my-4">
              <small className="font-medium">Secondary color</small>

              <ColorPicker
                value={getSelectorValue(':root', '--secondary-color') || '#fff'}
                onValueChange={(value) =>
                  setSelectorValue(':root', '--secondary-color', value)
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="h-screen w-full bg-gray-300 flex justify-center overflow-y-auto p-10">
        <div
          className="bg-white rounded"
          style={{ minWidth: 960, minHeight: 1280 }}
        >
          {html && <iframe srcDoc={html} width={960} height={1280}></iframe>}
        </div>
      </div>
    </div>
  );
}
