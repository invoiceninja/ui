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
import {
  SAMPLE_INVOICE_DATA,
  replaceVariables,
} from '../../utils/variable-replacer';
import { Block } from '../../types';

interface TotalBlockProps {
  block: Block;
}

export const TotalBlock = memo(function TotalBlock({ block }: TotalBlockProps) {
  const {
    items,
    fontSize,
    align,
    labelColor,
    amountColor,
    totalFontSize,
    totalFontWeight,
    totalColor,
    balanceColor,
    spacing,
    labelPadding,
    valuePadding,
    labelValueGap,
    valueMinWidth,
  } = block.properties;

  const tableStyle: React.CSSProperties = {
    borderCollapse: 'collapse',
    ...(align === 'right' ? { marginLeft: 'auto' } : {}),
    ...(align === 'center' ? { margin: '0 auto' } : {}),
  };

  const gap = labelValueGap || '20px';

  return (
    <table style={tableStyle}>
      <tbody>
        {items
          .filter((item: any) => item.show)
          .map(
            (
              item: {
                show: boolean;
                isTotal?: boolean;
                isBalance?: boolean;
                field: string;
                label: string;
              },
              index: number
            ) => {
              const isTotal = item.isTotal;
              const isBalance = item.isBalance;
              const displayValue = replaceVariables(
                item.field,
                SAMPLE_INVOICE_DATA
              );

              return (
                <tr
                  key={index}
                  style={{
                    fontSize: isTotal ? totalFontSize : fontSize,
                    fontWeight: isTotal ? totalFontWeight : 'normal',
                  }}
                >
                  <td
                    style={{
                      color: labelColor,
                      paddingBottom: spacing,
                      padding: labelPadding || undefined,
                      paddingRight: gap,
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}:
                  </td>
                  <td
                    style={{
                      color: isBalance
                        ? balanceColor
                        : isTotal
                        ? totalColor
                        : amountColor,
                      paddingBottom: spacing,
                      padding: valuePadding || undefined,
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                      ...(valueMinWidth ? { minWidth: valueMinWidth } : {}),
                    }}
                  >
                    {displayValue}
                  </td>
                </tr>
              );
            }
          )}
      </tbody>
    </table>
  );
});
