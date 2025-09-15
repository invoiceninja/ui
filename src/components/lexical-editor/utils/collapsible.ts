/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function setDomHiddenUntilFound(dom: HTMLElement): void {
  // @ts-expect-error - hidden is not a valid property on HTMLElement
  dom.hidden = 'until-found';
}

export function domOnBeforeMatch(dom: HTMLElement, callback: () => void): void {
  // @ts-expect-error - onbeforematch is not a valid property on HTMLElement
  dom.onbeforematch = callback;
}
