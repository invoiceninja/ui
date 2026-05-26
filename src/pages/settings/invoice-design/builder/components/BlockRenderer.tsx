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
import { Block, FieldConfig } from '../types';
import { useBlockLabel } from '../block-library';
import { InvoiceData, replaceVariables } from '../utils/variable-replacer';
import { useSampleInvoiceData } from '../hooks/useSampleInvoiceData';
import { replaceLabelVariables, getSampleLabelValue } from '../utils/label-variables';
import { ensurePx } from '../utils/html-generator';
import {
  resolveTableBorderProps,
  tableHeaderCellBorderStyles,
  tableBodyCellBorderStyles,
} from '../utils/table-cell-borders';
import {
  DEFAULT_LABEL_TEXT_COLOR,
  DEFAULT_VALUE_TEXT_COLOR,
} from '../constants/design-colors';

interface BlockRendererProps {
  block: Block;
}

function buildFieldDisplayText(
  config: FieldConfig,
  data: InvoiceData
): string | null {
  const resolvedValue = replaceVariables(config.variable, data);

  if (
    config.hideIfEmpty !== false &&
    (!resolvedValue || resolvedValue.trim() === '')
  ) {
    return null;
  }

  return `${config.prefix || ''}${resolvedValue}${config.suffix || ''}`;
}

function renderFieldConfigs(
  fieldConfigs: FieldConfig[] | undefined,
  data: InvoiceData,
  style: React.CSSProperties
): React.ReactNode {
  if (!fieldConfigs || fieldConfigs.length === 0) {
    return null;
  }

  const fields = fieldConfigs
    .map((config) => {
      const displayText = buildFieldDisplayText(config, data);
      if (displayText === null) return null;
      return { config, displayText };
    })
    .filter(
      (entry): entry is { config: FieldConfig; displayText: string } =>
        entry !== null
    );

  if (fields.length === 0) {
    return <div style={style}>&nbsp;</div>;
  }

  // One <div> per field so per-field typography (fontSize / fontWeight /
  // fontStyle / color) saved on the FieldConfig is honoured. Block-level
  // style is the fallback via React style merge.
  return (
    <div style={style}>
      {fields.map(({ config, displayText }, index) => (
        <div
          key={index}
          style={{
            fontSize: config.fontSize,
            fontWeight: config.fontWeight,
            fontStyle: config.fontStyle,
            color: config.color,
          }}
        >
          {displayText}
        </div>
      ))}
    </div>
  );
}

interface BlockRendererProps {
  block: Block;
}

export const BlockRenderer = memo(function BlockRenderer({
  block,
}: BlockRendererProps) {
  const blockLabel = useBlockLabel(block.type);

  switch (block.type) {
    case 'text':
      return <TextBlockRenderer block={block} />;

    case 'logo':
    case 'image':
      return <ImageBlockRenderer block={block} />;

    case 'company-info':
      return <CompanyInfoRenderer block={block} />;

    case 'client-info':
    case 'client-shipping-info':
      return <ClientInfoRenderer block={block} />;

    case 'invoice-details':
      return <InvoiceDetailsRenderer block={block} />;

    case 'public-notes':
      return <PublicNotesRenderer block={block} />;

    case 'footer':
      return <FooterRenderer block={block} />;

    case 'terms':
      return <TermsRenderer block={block} />;

    case 'table':
    case 'tasks-table':
      return <TableBlockRenderer block={block} />;

    case 'total':
      return <TotalBlockRenderer block={block} />;

    case 'divider':
      return <DividerBlockRenderer block={block} />;

    case 'spacer':
      return <SpacerBlockRenderer block={block} />;

    case 'qrcode':
      return <QRCodeBlockRenderer block={block} />;

    case 'signature':
      return <SignatureBlockRenderer block={block} />;

    default:
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
          {blockLabel}
        </div>
      );
  }
});

// Individual block renderers
function TextBlockRenderer({ block }: BlockRendererProps) {
  const { t } = useTranslation();
  const sampleData = useSampleInvoiceData();
  const { content, fontSize, fontWeight, color, align, lineHeight } =
    block.properties;
  const displayContent = replaceVariables(
    content || t('text'),
    sampleData
  );

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        textAlign: align,
        lineHeight,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {displayContent}
    </div>
  );
}

function ImageBlockRenderer({ block }: BlockRendererProps) {
  const { t } = useTranslation();
  const sampleData = useSampleInvoiceData();
  const { source, align, maxWidth, objectFit } = block.properties;

  // sampleData.company.logo is injected from useLogo() so $company.logo
  // resolves to the current user's actual logo in the canvas preview.
  const resolvedSource = replaceVariables(source, sampleData);

  // Map text alignment to flexbox justify-content
  const justifyContent =
    align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  return (
    <div
      style={{
        textAlign: align,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent,
      }}
    >
      {resolvedSource ? (
        <img
          src={resolvedSource}
          alt={String(block.type === 'logo' ? t('company_logo') : t('image'))}
          style={{ maxWidth, objectFit, maxHeight: '100%' }}
        />
      ) : (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-300 rounded">
          {block.type === 'logo' ? t('company_logo') : t('image')}
        </div>
      )}
    </div>
  );
}

function CompanyInfoRenderer({ block }: BlockRendererProps) {
  const sampleData = useSampleInvoiceData();
  const {
    fieldConfigs,
    content,
    fontSize,
    lineHeight,
    align,
    color,
    padding,
    showTitle,
    title,
    titleFontSize,
    titleFontWeight,
    titleFontStyle,
    titleColor,
    titleAlign,
    titlePrefix,
    titleSuffix,
  } = block.properties;

  return (
    <div style={{ padding }}>
      {showTitle && (
        <div
          style={{
            fontSize: titleFontSize || fontSize,
            fontWeight: titleFontWeight,
            fontStyle: titleFontStyle,
            color: titleColor || color,
            textAlign: titleAlign || align,
            marginBottom: '8px',
          }}
        >
          {titlePrefix}{title}{titleSuffix}
        </div>
      )}

      {fieldConfigs?.length > 0 ? (
        renderFieldConfigs(fieldConfigs, sampleData, {
          fontSize,
          lineHeight,
          textAlign: align,
          color,
        })
      ) : (
        <div
          style={{
            fontSize,
            lineHeight,
            textAlign: align,
            color,
            whiteSpace: 'pre-line',
          }}
        >
          {replaceVariables(content, sampleData)}
        </div>
      )}
    </div>
  );
}

function ClientInfoRenderer({ block }: BlockRendererProps) {
  const sampleData = useSampleInvoiceData();
  const {
    fieldConfigs,
    content,
    fontSize,
    lineHeight,
    align,
    color,
    padding,
    showTitle,
    title,
    titleFontSize,
    titleFontWeight,
    titleFontStyle,
    titleColor,
    titleAlign,
    titlePrefix,
    titleSuffix,
  } = block.properties;

  return (
    <div style={{ padding }}>
      {showTitle && (
        <div
          style={{
            fontSize: titleFontSize || fontSize,
            fontWeight: titleFontWeight,
            fontStyle: titleFontStyle,
            color: titleColor || color,
            textAlign: titleAlign || align,
            marginBottom: '8px',
          }}
        >
          {titlePrefix}{title}{titleSuffix}
        </div>
      )}

      {fieldConfigs?.length > 0 ? (
        renderFieldConfigs(fieldConfigs, sampleData, {
          fontSize,
          lineHeight,
          textAlign: align,
          color,
        })
      ) : (
        <div
          style={{
            fontSize,
            lineHeight,
            textAlign: align,
            color,
            whiteSpace: 'pre-line',
          }}
        >
          {replaceVariables(content, sampleData)}
        </div>
      )}
    </div>
  );
}

function InvoiceDetailsRenderer({ block }: BlockRendererProps) {
  const { t } = useTranslation();
  const sampleData = useSampleInvoiceData();
  const {
    fieldConfigs,
    fontSize,
    lineHeight,
    align,
    color,
    labelColor,
    showLabels,
    padding,
    labelAlign,
    valueAlign,
    labelPadding,
    valuePadding,
    labelValueGap,
    rowSpacing,
    valueMinWidth,
  } = block.properties;

  // Match server-side rendering: two-column table (label | value). When the
  // block is right-aligned, the table itself shrinks to fit-content and is
  // pushed to the right edge with margin-left:auto.
  const tableAlign = align === 'right' ? 'right' : align === 'center' ? 'center' : 'left';
  const colLabelAlign = (labelAlign as 'left' | 'center' | 'right') || 'right';
  const colValueAlign = (valueAlign as 'left' | 'center' | 'right') || 'right';
  const gap = ensurePx(labelValueGap) || '12px';
  const labelPaddingPx = ensurePx(labelPadding);
  const valuePaddingPx = ensurePx(valuePadding);
  const rowSpacingPx = ensurePx(rowSpacing);
  const valueMinWidthPx = ensurePx(valueMinWidth);
  const blockPaddingPx = ensurePx(padding);

  return (
    <div style={{ padding: blockPaddingPx }}>
      <table
        style={{
          borderCollapse: 'collapse',
          width: tableAlign === 'left' ? '100%' : 'auto',
          marginLeft: tableAlign === 'right' ? 'auto' : tableAlign === 'center' ? 'auto' : undefined,
          marginRight: tableAlign === 'center' ? 'auto' : undefined,
          fontSize,
          lineHeight,
          color,
        }}
      >
        <tbody>
          {fieldConfigs?.map((field: FieldConfig, index: number) => {
            const displayValue = replaceVariables(field.variable, sampleData);

            if (
              field.hideIfEmpty !== false &&
              (!displayValue || displayValue.trim() === '')
            ) {
              return null;
            }

            const ls = field.labelStyle;
            const vs = field.valueStyle;
            const labelFontSize = ls?.fontSize || field.fontSize || fontSize;
            const labelFontWeight = ls?.fontWeight || field.fontWeight;
            const labelFontStyle = ls?.fontStyle || field.fontStyle;
            const labelTextColor =
              ls?.color ||
              field.color ||
              labelColor ||
              DEFAULT_LABEL_TEXT_COLOR;

            const valueFontSize = vs?.fontSize || field.fontSize || fontSize;
            const valueFontWeight = vs?.fontWeight || field.fontWeight;
            const valueFontStyle = vs?.fontStyle || field.fontStyle;
            const valueTextColor =
              vs?.color ||
              field.color ||
              color ||
              DEFAULT_VALUE_TEXT_COLOR;

            // Label source: explicit `field.label` resolves via label
            // variables; fall back to prefix with trailing ":\s*" stripped so
            // the table cell doesn't double-emit the colon.
            const labelSource =
              field.label || field.prefix?.replace(/:\s*$/, '') || '';
            const labelText = replaceLabelVariables(labelSource, t);
            const valueText = `${displayValue}${field.suffix || ''}`;

            return (
              <tr key={field.id || index}>
                {showLabels !== false && (
                  <td
                    style={{
                      fontSize: labelFontSize,
                      fontWeight: labelFontWeight,
                      fontStyle: labelFontStyle,
                      color: labelTextColor,
                      padding: labelPaddingPx || 0,
                      paddingRight: gap,
                      paddingBottom: rowSpacingPx || undefined,
                      whiteSpace: 'nowrap',
                      textAlign: colLabelAlign,
                    }}
                  >
                    {labelText}
                  </td>
                )}
                <td
                  style={{
                    fontSize: valueFontSize,
                    fontWeight: valueFontWeight,
                    fontStyle: valueFontStyle,
                    color: valueTextColor,
                    padding: valuePaddingPx || 0,
                    paddingBottom: rowSpacingPx || undefined,
                    minWidth: valueMinWidthPx || undefined,
                    textAlign: colValueAlign,
                  }}
                >
                  {valueText}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PublicNotesRenderer({ block }: BlockRendererProps) {
  const { t } = useTranslation();
  const sampleData = useSampleInvoiceData();
  const { content, fontSize, fontWeight, color, align, lineHeight, padding } =
    block.properties;

  const contentToRender = content || '$invoice.public_notes';
  const displayContent = replaceVariables(contentToRender, sampleData);

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        textAlign: align,
        lineHeight,
        padding,
        height: '100%',
        whiteSpace: 'pre-line',
      }}
    >
      {displayContent || (
        <span className="text-gray-400 italic">
          {t('public_notes_will_appear_here')}
        </span>
      )}
    </div>
  );
}

function FooterRenderer({ block }: BlockRendererProps) {
  const { t } = useTranslation();
  const sampleData = useSampleInvoiceData();
  const { content, fontSize, fontWeight, color, align, lineHeight, padding } =
    block.properties;

  const contentToRender = content || '$invoice.footer';
  const displayContent = replaceVariables(contentToRender, sampleData);

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        textAlign: align,
        lineHeight,
        padding,
        height: '100%',
        whiteSpace: 'pre-line',
      }}
    >
      {displayContent || (
        <span className="text-gray-400 italic">
          {t('footer_will_appear_here')}
        </span>
      )}
    </div>
  );
}

function TermsRenderer({ block }: BlockRendererProps) {
  const { t } = useTranslation();
  const sampleData = useSampleInvoiceData();
  const { content, fontSize, fontWeight, color, align, lineHeight, padding } =
    block.properties;

  const contentToRender = content || '$invoice.terms';
  const displayContent = replaceVariables(contentToRender, sampleData);

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        textAlign: align,
        lineHeight,
        padding,
        height: '100%',
        whiteSpace: 'pre-line',
      }}
    >
      {displayContent || (
        <span className="text-gray-400 italic">
          {t('terms_will_appear_here')}
        </span>
      )}
    </div>
  );
}

function TableBlockRenderer({ block }: BlockRendererProps) {
  const sampleData = useSampleInvoiceData();
  const {
    columns,
    headerBg,
    headerColor,
    headerFontWeight,
    fontSize,
    padding,
    rowBg,
    alternateRowBg,
    alternateRows,
    rowColor,
  } = block.properties;

  const borderResolved = resolveTableBorderProps(block.properties);

  const resolveItemValue = (
    field: string,
    item: Record<string, unknown>
  ): string => {
    // Extract field from item.field format (e.g., "item.product_key" -> "product_key")
    const fieldKey = field.startsWith('item.')
      ? field.replace('item.', '')
      : field;
    const value = item[fieldKey];

    if (typeof value === 'number') {
      if (
        fieldKey === 'cost' ||
        fieldKey === 'line_total' ||
        fieldKey === 'gross_line_total'
      ) {
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
              (
                col: {
                  id: string;
                  header: string;
                  align: string;
                  width: string;
                  field: string;
                },
                colIndex: number
              ) => (
                <th
                  key={col.id}
                  style={{
                    padding,
                    textAlign: col.align as 'left' | 'center' | 'right',
                    width: col.width,
                    ...tableHeaderCellBorderStyles(
                      borderResolved,
                      colIndex,
                      columns.length
                    ),
                  }}
                >
                  {col.header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {sampleData.line_items.map((item, index) => (
            <tr
              key={index}
              style={{
                backgroundColor:
                  alternateRows && index % 2 === 1 ? alternateRowBg : rowBg,
              }}
            >
              {columns.map(
                (
                  col: { id: string; align: string; field: string },
                  colIndex: number
                ) => (
                  <td
                    key={col.id}
                    style={{
                      padding,
                      textAlign: col.align as 'left' | 'center' | 'right',
                      ...tableBodyCellBorderStyles(
                        borderResolved,
                        index,
                        colIndex,
                        columns.length
                      ),
                      color: rowColor ?? DEFAULT_VALUE_TEXT_COLOR,
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
}

function TotalBlockRenderer({ block }: BlockRendererProps) {
  const { t } = useTranslation();
  const sampleData = useSampleInvoiceData();
  const {
    items,
    fontSize,
    align,
    labelAlign,
    valueAlign,
    labelColor,
    amountColor,
    totalFontSize,
    totalFontWeight,
    totalColor,
    balanceColor,
    spacing,
    padding,
    labelPadding,
    valuePadding,
    labelValueGap,
    valueMinWidth,
  } = block.properties;

  // Use table for proper label/value alignment
  const tableStyle: React.CSSProperties = {
    borderCollapse: 'collapse',
    ...(align === 'right' ? { marginLeft: 'auto' } : {}),
    ...(align === 'center' ? { margin: '0 auto' } : {}),
  };

  const gap = ensurePx(labelValueGap) || '20px';
  const colLabelAlign = (labelAlign as 'left' | 'center' | 'right') || 'right';
  const colValueAlign = (valueAlign as 'left' | 'center' | 'right') || 'right';
  const labelPaddingPx = ensurePx(labelPadding);
  const valuePaddingPx = ensurePx(valuePadding);
  const spacingPx = ensurePx(spacing);
  const valueMinWidthPx = ensurePx(valueMinWidth);
  const blockPaddingPx = ensurePx(padding);

  return (
    <div style={{ padding: blockPaddingPx }}>
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
                labelStyle?: { fontSize?: string; fontWeight?: string; fontStyle?: string; color?: string };
                valueStyle?: { fontSize?: string; fontWeight?: string; fontStyle?: string; color?: string };
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
              const displayValue = replaceVariables(item.field, sampleData);

              const ls = item.labelStyle;
              const vs = item.valueStyle;
              const rowDefaultFontSize = isTotal ? totalFontSize : fontSize;
              const rowDefaultFontWeight = isTotal ? totalFontWeight : 'normal';
              const rowDefaultValueColor =
                (isBalance
                  ? balanceColor
                  : isTotal
                    ? totalColor
                    : amountColor) || DEFAULT_VALUE_TEXT_COLOR;

              const labelFontSize = ls?.fontSize || item.fontSize || rowDefaultFontSize;
              const labelFontWeight = ls?.fontWeight || item.fontWeight || rowDefaultFontWeight;
              const labelFontStyle = ls?.fontStyle || item.fontStyle;
              const labelTextColor =
                ls?.color ||
                item.color ||
                labelColor ||
                DEFAULT_LABEL_TEXT_COLOR;

              const valueFontSize = vs?.fontSize || item.fontSize || rowDefaultFontSize;
              const valueFontWeight = vs?.fontWeight || item.fontWeight || rowDefaultFontWeight;
              const valueFontStyle = vs?.fontStyle || item.fontStyle;
              const valueTextColor =
                vs?.color || item.amountColor || rowDefaultValueColor;

              return (
                <tr key={index}>
                  <td
                    style={{
                      fontSize: labelFontSize,
                      fontWeight: labelFontWeight,
                      fontStyle: labelFontStyle || undefined,
                      color: labelTextColor,
                      paddingBottom: spacingPx,
                      padding: labelPaddingPx || undefined,
                      paddingRight: gap,
                      textAlign: colLabelAlign,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getSampleLabelValue(item.label, t)}:
                  </td>
                  <td
                    style={{
                      fontSize: valueFontSize,
                      fontWeight: valueFontWeight,
                      fontStyle: valueFontStyle || undefined,
                      color: valueTextColor,
                      paddingBottom: spacingPx,
                      padding: valuePaddingPx || undefined,
                      textAlign: colValueAlign,
                      whiteSpace: 'nowrap',
                      ...(valueMinWidthPx ? { minWidth: valueMinWidthPx } : {}),
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
    </div>
  );
}

function DividerBlockRenderer({ block }: BlockRendererProps) {
  const { thickness, color, style, marginTop, marginBottom } = block.properties;

  return (
    <hr
      style={{
        border: 'none',
        borderTop: `${thickness} ${style} ${color}`,
        marginTop,
        marginBottom,
      }}
    />
  );
}

function SpacerBlockRenderer({ block }: BlockRendererProps) {
  const { height } = block.properties;

  return <div style={{ height }} />;
}

function QRCodeBlockRenderer({ block }: BlockRendererProps) {
  const { t } = useTranslation();
  const { size, align, qrType } = block.properties;

  const getQrLabel = () => {
    switch (qrType) {
      case 'sepa':
        return t('sepa_qr');
      case 'swiss':
        return t('swiss_qr');
      case 'spc':
        return t('spc_qr');
      case 'verifactu':
        return t('verifactu_qr');
      case 'payment_link':
      default:
        return t('payment_qr');
    }
  };

  return (
    <div style={{ textAlign: align }}>
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: '#f3f4f6',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #e5e7eb',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <span className="text-gray-400 text-xs font-medium">
          {getQrLabel()}
        </span>
        <span className="text-gray-300 text-[10px]">{size}</span>
      </div>
    </div>
  );
}

function SignatureBlockRenderer({ block }: BlockRendererProps) {
  const { t } = useTranslation();
  const { label, showLine, showDate, align, fontSize, color } =
    block.properties;

  return (
    <div style={{ textAlign: align }}>
      <div style={{ marginBottom: '40px' }} />
      {showLine && (
        <div
          style={{
            borderTop: '1px solid #000',
            width: '200px',
            marginBottom: '8px',
            display: align === 'center' ? 'inline-block' : 'block',
          }}
        />
      )}
      
    </div>
  );
}
