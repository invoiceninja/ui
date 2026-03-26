/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { memo } from 'react';
import { SAMPLE_INVOICE_DATA } from '../../utils/variable-replacer';
import { Block } from '../../types';

interface TableBlockProps {
  block: Block;
}

export const TableBlock = memo(function TableBlock({ block }: TableBlockProps) {
  const {
    columns,
    headerBg,
    headerColor,
    headerFontWeight,
    borderColor,
    fontSize,
    padding,
    showBorders,
    rowBg,
    alternateRowBg,
    alternateRows,
  } = block.properties;

  const resolveItemValue = (
    field: string,
    item: Record<string, unknown>
  ): string => {
    const fieldKey = field.startsWith('item.')
      ? field.replace('item.', '')
      : field;
    const value = item[fieldKey];

    if (typeof value === 'number') {
      if (fieldKey === 'cost' || fieldKey === 'line_total') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      }
      return String(value);
    }
    return String(value || '');
  };

  return (
    <div className="w-full h-full overflow-auto">
      <table
        className="w-full"
        style={{ fontSize, borderCollapse: 'collapse' }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: headerBg,
              color: headerColor,
              fontWeight: headerFontWeight,
            }}
          >
            {columns.map(
              (col: {
                id: string;
                header: string;
                align: string;
                width: string;
                field: string;
              }) => (
                <th
                  key={col.id}
                  style={{
                    padding,
                    textAlign: col.align as 'left' | 'center' | 'right',
                    width: col.width,
                    border: showBorders ? `1px solid ${borderColor}` : 'none',
                  }}
                >
                  {col.header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {SAMPLE_INVOICE_DATA.line_items.map((item, index) => (
            <tr
              key={`item-${index}`}
              style={{
                backgroundColor:
                  alternateRows && index % 2 === 1 ? alternateRowBg : rowBg,
              }}
            >
              {columns.map(
                (col: { id: string; align: string; field: string }) => (
                  <td
                    key={col.id}
                    style={{
                      padding,
                      textAlign: col.align as 'left' | 'center' | 'right',
                      border: showBorders ? `1px solid ${borderColor}` : 'none',
                    }}
                  >
                    {resolveItemValue(col.field, item)}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
