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
import {
  DEFAULT_LABEL_TEXT_COLOR,
  DEFAULT_VALUE_TEXT_COLOR,
} from '../../constants/design-colors';
import { useLabelMapping } from '../../utils/label-variables';

interface TotalBlockProps {
  block: Block;
}

export const TotalBlock = memo(function TotalBlock({ block }: TotalBlockProps) {
  const [t] = useTranslation();
  const labelMapping = useLabelMapping();

  const {
    items,
    align,
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
        {items.map(
          (
            item: {
              show: boolean;
              isTotal?: boolean;
                isBalance?: boolean;
                field: string;
                label: string;
                labelStyle?: {
                  fontSize?: string;
                  fontWeight?: string;
                  fontStyle?: string;
                  color?: string;
                };
                valueStyle?: {
                  fontSize?: string;
                  fontWeight?: string;
                  fontStyle?: string;
                  color?: string;
                };
                fontSize?: string;
                fontWeight?: string;
                color?: string;
              fontStyle?: string;
              amountColor?: string;
            },
            index: number
          ) => {
            const displayValue = replaceVariables(
              item.field,
              SAMPLE_INVOICE_DATA
            );

            const labelStyle = item.labelStyle;
            const valueStyle = item.valueStyle;
            const labelFontSize = labelStyle?.fontSize || item.fontSize;
            const valueFontSize = valueStyle?.fontSize || item.fontSize;
            const labelFontWeight = labelStyle?.fontWeight || item.fontWeight;
            const valueFontWeight = valueStyle?.fontWeight || item.fontWeight;
            const labelFontStyle = labelStyle?.fontStyle || item.fontStyle;
            const valueFontStyle = valueStyle?.fontStyle || item.fontStyle;
            const labelColor =
              labelStyle?.color || item.color || DEFAULT_LABEL_TEXT_COLOR;
            const valueColor =
              valueStyle?.color || item.amountColor || DEFAULT_VALUE_TEXT_COLOR;

            return (
              <tr key={index}>
                <td
                  style={{
                    color: labelColor,
                    fontSize: labelFontSize,
                    fontWeight: labelFontWeight,
                    fontStyle: labelFontStyle,
                    paddingBottom: spacing,
                    padding: labelPadding || undefined,
                    paddingRight: gap,
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {labelMapping.getDisplayLabel(item.label)}:
                </td>
                <td
                  style={{
                    color: valueColor,
                    fontSize: valueFontSize,
                    fontWeight: valueFontWeight,
                    fontStyle: valueFontStyle,
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
