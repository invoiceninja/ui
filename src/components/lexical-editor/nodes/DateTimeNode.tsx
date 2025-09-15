/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { JSX } from 'react';

import {
  $getState,
  $setState,
  buildImportMap,
  createState,
  DecoratorNode,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  SerializedLexicalNode,
  Spread,
  StateConfigValue,
  StateValueOrUpdater,
} from 'lexical';
import DateTimeComponent from '../components/DateTimeComponent';

const getDateTimeText = (dateTime: Date) => {
  if (dateTime === undefined) {
    return '';
  }
  const hours = dateTime?.getHours();
  const minutes = dateTime?.getMinutes();
  return (
    dateTime.toDateString() +
    (hours === 0 && minutes === 0
      ? ''
      : ` ${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}`)
  );
};

export type SerializedDateTimeNode = Spread<
  {
    dateTime?: string;
  },
  SerializedLexicalNode
>;

function $convertDateTimeElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const dateTimeValue = domNode.getAttribute('data-lexical-datetime');
  if (dateTimeValue) {
    const node = $createDateTimeNode(new Date(Date.parse(dateTimeValue)));
    return { node };
  }
  const gDocsDateTimePayload = domNode.getAttribute('data-rich-links');
  if (!gDocsDateTimePayload) {
    return null;
  }
  const parsed = JSON.parse(gDocsDateTimePayload);
  const parsedDate = Date.parse(parsed?.dat_df?.dfie_dt || '');
  if (isNaN(parsedDate)) {
    return null;
  }
  const node = $createDateTimeNode(new Date(parsedDate));
  return { node };
}

const dateTimeState = createState('dateTime', {
  parse: (v) => new Date(v as string),
  unparse: (v) => v.toISOString(),
});

export class DateTimeNode extends DecoratorNode<JSX.Element> {
  $config() {
    return this.config('datetime', {
      extends: DecoratorNode,
      importDOM: buildImportMap({
        span: (domNode) =>
          domNode.getAttribute('data-lexical-datetime') !== null ||
          // GDocs Support
          (domNode.getAttribute('data-rich-links') !== null &&
            JSON.parse(domNode.getAttribute('data-rich-links') || '{}').type ===
              'date')
            ? {
                conversion: $convertDateTimeElement,
                priority: 2,
              }
            : null,
      }),
      stateConfigs: [{ flat: true, stateConfig: dateTimeState }],
    });
  }

  getDateTime(): StateConfigValue<typeof dateTimeState> {
    return $getState(this, dateTimeState);
  }

  setDateTime(valueOrUpdater: StateValueOrUpdater<typeof dateTimeState>): this {
    return $setState(this, dateTimeState, valueOrUpdater);
  }

  getTextContent(): string {
    const dateTime = this.getDateTime();
    return getDateTimeText(dateTime);
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span');
    element.textContent = getDateTimeText(this.getDateTime());
    element.setAttribute(
      'data-lexical-datetime',
      this.getDateTime()?.toString() || ''
    );
    return { element };
  }

  createDOM(): HTMLElement {
    const element = document.createElement('span');
    element.setAttribute(
      'data-lexical-datetime',
      this.getDateTime()?.toString() || ''
    );
    element.style.display = 'inline-block';
    return element;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return true;
  }

  decorate(): JSX.Element {
    return (
      <DateTimeComponent dateTime={this.getDateTime()} nodeKey={this.__key} />
    );
  }
}

export function $createDateTimeNode(dateTime: Date): DateTimeNode {
  return new DateTimeNode().setDateTime(dateTime);
}

export function $isDateTimeNode(
  node: LexicalNode | null | undefined
): node is DateTimeNode {
  return node instanceof DateTimeNode;
}
