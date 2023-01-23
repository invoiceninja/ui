/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '@invoiceninja/forms';
import { useLogo } from 'common/hooks/useLogo';
import { ColorPicker } from 'components/forms/ColorPicker';
import { useState } from 'react';
import { ArrowLeft } from 'react-feather';

export const template = `
  <style>
    :root {
      --primary-color: $primary_color;
      --secondary-color: $secondary_color;
      --line-height: 1.6;
    }
  
    .company-logo {
      max-width: 65%;
    }

    .text-primary {
      color: var(--primary-color);
    }

    .text-secondary {
      color: var(--secondary-color);
    }
  </style>
  
  <img src="https://forum.invoiceninja.com/uploads/default/original/2X/6/672414e38c31024298b506d24ffc4d5e3c3b488e.png" class="company-logo" />
  <p class="text-primary">Primary text</p>
  <p class="text-secondary">Secondary text</p>
`;

interface Element {
  selector: string;
  value: string | null;
  property: string;
}

interface Compilation {
  html: string;
  elements: Element[];
}

const defaultSet: Element[] = [
  { selector: ':root', property: '--primary-color', value: 'red' },
  { selector: ':root', property: '--secondary-color', value: 'blue' },
  { selector: '.company-logo', property: 'max-width', value: '15%' },
];

class Builder {
  #document!: Document;
  #css = new CSSStyleSheet();

  constructor(html: string, public elements: Element[]) {
    this.#document = new DOMParser().parseFromString(html, 'text/html');

    const style = this.#document.querySelector('style');

    if (style) {
      this.#css.replaceSync(style.innerHTML);
      this.#sync();
    }
  }

  #sync() {
    // This injects elements from the context object (settings)

    this.elements.map((element) => {
      this.setSelectorValue(element.selector, element.property, element.value);
    });
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

  #elements() {
    this.elements.map((element, index) => {
      this.elements[index].value = this.getSelectorValue(
        element.selector,
        element.property
      );
    });

    return this.elements;
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
      elements: this.#elements(),
    } satisfies Compilation;
  }
}

export function Designer() {
  const logo = useLogo();
  const [html, setHtml] = useState(template);
  const [elements] = useState<Element[]>(defaultSet);
  const builder = new Builder(html, elements);

  const handleSelectorChange = (
    selector: string,
    property: string,
    value: string
  ) => {
    const { html } = builder
      .setSelectorValue(selector, property, value)
      .compile();

    setHtml(html);
  };

  // Two ways of updating stuff.
  // 1. Direct selector (.company-size) example
  // 2. Updating settings which will trigger update of the elements array (primary color example).

  return (
    <div className="flex">
      <div className="h-screen w-1/3 bg-gray-100">
        <div className="inline-flex items-center p-6">
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
                  // value={elements.logo?.size.value || 0}
                  id="slider"
                  onChange={(event) =>
                    handleSelectorChange(
                      '.company-logo',
                      'max-width',
                      `${event.target.value}%`
                    )
                  }
                />
                <span className="text-sm">
                  {elements.find(
                    (element) => element.selector === '.company-logo'
                  )?.value || 0}
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
                value={
                  elements.find(
                    (element) =>
                      element.selector === ':root' &&
                      element.property === '--primary-color'
                  )?.value || '#fff'
                }
                onValueChange={(value) =>
                  handleSelectorChange(':root', '--primary-color', value)
                }
              />
            </div>

            <div className="flex flex-col space-y-2 my-4">
              <small className="font-medium">Secondary color</small>

              <ColorPicker
                value={
                  elements.find(
                    (element) =>
                      element.selector === ':root' &&
                      element.property === '--secondary-color'
                  )?.value || '#fff'
                }
                onValueChange={(value) =>
                  handleSelectorChange(':root', '--secondary-color', value)
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="h-screen w-full bg-gray-300 flex justify-center overflow-y-auto p-10">
        <div
          className="bg-white p-10 rounded"
          style={{ minWidth: 960, minHeight: 1280 }}
        >
          {html && <iframe srcDoc={html} width={960} height={1280}></iframe>}
        </div>
      </div>
    </div>
  );
}
