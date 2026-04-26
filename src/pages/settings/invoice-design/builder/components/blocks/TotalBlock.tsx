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
import { useTranslation } from 'react-i18next';
import {
  SAMPLE_INVOICE_DATA,
  replaceVariables,
} from '../../utils/variable-replacer';
import { Block } from '../../types';
import { useLabelMapping } from '../../utils/label-variables';

interface TotalBlockProps {
  block: Block;
}

export const TotalBlock = memo(function TotalBlock({ block }: TotalBlockProps) {
  const [t] = useTranslation();
  const labelMapping = useLabelMapping();
  
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
                fontSize?: string;
                fontWeight?: string;
                color?: string;
                fontStyle?: string;
                amountColor?: string;
              },
              index: number
            ) => {
              const isTotal = item.isTotal;
              const isBalance = item.isBalance;
              const displayValue = replaceVariables(
                item.field,
                SAMPLE_INVOICE_DATA
              );

              const itemFontSize =
                item.fontSize || (isTotal ? totalFontSize : fontSize);
              const itemFontWeight =
                item.fontWeight || (isTotal ? totalFontWeight : 'normal');
              const itemColor = item.color || labelColor;

              return (
                <tr
                  key={index}
                  style={{
                    fontSize: itemFontSize,
                    fontWeight: itemFontWeight,
                  }}
                >
                  <td
                    style={{
                      color: itemColor,
                      paddingBottom: spacing,
                      padding: labelPadding || undefined,
                      paddingRight: gap,
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                      fontStyle: item.fontStyle || undefined,
                    }}
                  >
                    {labelMapping.getDisplayLabel(item.label)}:
                  </td>
                  <td
                    style={{
                      color: item.amountColor || (isBalance
                        ? balanceColor
                        : isTotal
                          ? totalColor
                          : amountColor),
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
