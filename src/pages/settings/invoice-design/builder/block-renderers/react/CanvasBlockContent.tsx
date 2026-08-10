/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { memo, type CSSProperties, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Block,
  ClientInfoBlock,
  ClientShippingInfoBlock,
  CompanyInfoBlock,
  DividerBlock,
  FieldConfig,
  FooterBlock,
  ImageBlock,
  InvoiceDetailsBlock,
  LogoBlock,
  PublicNotesBlock,
  QRCodeBlock,
  SpacerBlock,
  TableBlock,
  TasksTableBlock,
  TermsBlock,
  TextBlock,
  TotalBlock,
  TotalItem,
} from '../../types';
import { useBlockLabel } from '../../block-library';
import { InvoiceData, replaceVariables } from '../../utils/variable-replacer';
import { useSampleInvoiceData } from '../../hooks/useSampleInvoiceData';
import {
  replaceLabelVariables,
  getSampleLabelValue,
} from '../../utils/label-variables';
import {
  resolveTableBorderProps,
  tableHeaderCellBorderStyles,
  tableBodyCellBorderStyles,
} from '../../utils/table-cell-borders';
import {
  DEFAULT_LABEL_TEXT_COLOR,
  DEFAULT_VALUE_TEXT_COLOR,
} from '../../constants/design-colors';
import { SignatureBlockRenderer } from '../../components/SignatureBlockRenderer';
import { useColorScheme } from '$app/common/colors';
import { ensurePx } from '../shared/style-utils';
import {
  buildFieldDisplayText,
  resolveFlexJustifyContent,
  resolveItemValue,
} from '../shared/field-configs';

interface CanvasBlockContentProps {
  block: Block;
}

type TextLikeBlock = TextBlock | PublicNotesBlock | FooterBlock | TermsBlock;
type ImageLikeBlock = ImageBlock | LogoBlock;
type ClientLikeBlock = ClientInfoBlock | ClientShippingInfoBlock;
type TableLikeBlock = TableBlock | TasksTableBlock;

function asTextAlign(align?: string): CSSProperties['textAlign'] {
  return (align as CSSProperties['textAlign']) || 'left';
}

function asObjectFit(objectFit?: string): CSSProperties['objectFit'] {
  return objectFit as CSSProperties['objectFit'];
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

export const CanvasBlockContent = memo(function CanvasBlockContent({
  block,
}: CanvasBlockContentProps) {
  const blockLabel = useBlockLabel(block.type);
  const colors = useColorScheme();

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
        <div
          className="flex items-center justify-center h-full text-sm"
          style={{
            backgroundColor: colors.$23,
            color: colors.$17,
          }}
        >
          {blockLabel}
        </div>
      );
  }
});

function TextBlockRenderer({ block }: { block: TextLikeBlock }) {
  const { t } = useTranslation();
  const sampleData = useSampleInvoiceData();
  const { content, fontSize, fontWeight, color, align, lineHeight } =
    block.properties;
  const displayContent = replaceVariables(content || t('text'), sampleData);

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        textAlign: asTextAlign(align),
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

function EmptyContentPlaceholder({ children }: { children: ReactNode }) {
  const colors = useColorScheme();

  return (
    <span style={{ color: colors.$17, fontStyle: 'italic' }}>{children}</span>
  );
}

function ImageBlockRenderer({ block }: { block: ImageLikeBlock }) {
  const { t } = useTranslation();
  const colors = useColorScheme();
  const sampleData = useSampleInvoiceData();
  const { source, align, maxWidth, objectFit } = block.properties;

  const resolvedSource = replaceVariables(source || '', sampleData);
  const justifyContent = resolveFlexJustifyContent(align);

  return (
    <div
      style={{
        textAlign: asTextAlign(align),
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
          style={{ maxWidth, objectFit: asObjectFit(objectFit), maxHeight: '100%' }}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-xs border-2 border-dashed rounded"
          style={{
            backgroundColor: colors.$23,
            color: colors.$17,
            borderColor: colors.$24,
          }}
        >
          {block.type === 'logo' ? t('company_logo') : t('image')}
        </div>
      )}
    </div>
  );
}

function CompanyInfoRenderer({ block }: { block: CompanyInfoBlock }) {
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
            textAlign: asTextAlign(titleAlign || align),
            marginBottom: '8px',
          }}
        >
          {titlePrefix}
          {title}
          {titleSuffix}
        </div>
      )}

      {fieldConfigs && fieldConfigs.length > 0 ? (
        renderFieldConfigs(fieldConfigs, sampleData, {
          fontSize: fontSize || undefined,
          lineHeight,
          textAlign: asTextAlign(align),
          color,
        })
      ) : (
        <div
          style={{
            fontSize,
            lineHeight,
            textAlign: asTextAlign(align),
            color,
            whiteSpace: 'pre-line',
          }}
        >
          {replaceVariables(content || '', sampleData)}
        </div>
      )}
    </div>
  );
}

function ClientInfoRenderer({ block }: { block: ClientLikeBlock }) {
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
            textAlign: asTextAlign(titleAlign || align),
            marginBottom: '8px',
          }}
        >
          {titlePrefix}
          {title}
          {titleSuffix}
        </div>
      )}

      {fieldConfigs && fieldConfigs.length > 0 ? (
        renderFieldConfigs(fieldConfigs, sampleData, {
          fontSize: fontSize || undefined,
          lineHeight,
          textAlign: asTextAlign(align),
          color,
        })
      ) : (
        <div
          style={{
            fontSize,
            lineHeight,
            textAlign: asTextAlign(align),
            color,
            whiteSpace: 'pre-line',
          }}
        >
          {replaceVariables(content || '', sampleData)}
        </div>
      )}
    </div>
  );
}

function InvoiceDetailsRenderer({ block }: { block: InvoiceDetailsBlock }) {
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

  const tableAlign =
    align === 'right' ? 'right' : align === 'center' ? 'center' : 'left';
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
          marginLeft:
            tableAlign === 'right'
              ? 'auto'
              : tableAlign === 'center'
              ? 'auto'
              : undefined,
          marginRight: tableAlign === 'center' ? 'auto' : undefined,
          fontSize: fontSize || undefined,
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
            const labelFontSize = ls?.fontSize || field.fontSize;
            const labelFontWeight = ls?.fontWeight || field.fontWeight;
            const labelFontStyle = ls?.fontStyle || field.fontStyle;
            const labelTextColor =
              ls?.color ||
              field.color ||
              labelColor ||
              DEFAULT_LABEL_TEXT_COLOR;

            const valueFontSize = vs?.fontSize || field.fontSize;
            const valueFontWeight = vs?.fontWeight || field.fontWeight;
            const valueFontStyle = vs?.fontStyle || field.fontStyle;
            const valueTextColor =
              vs?.color || field.color || color || DEFAULT_VALUE_TEXT_COLOR;

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

function PublicNotesRenderer({ block }: { block: PublicNotesBlock }) {
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
        textAlign: asTextAlign(align),
        lineHeight,
        padding,
        height: '100%',
        whiteSpace: 'pre-line',
      }}
    >
      {displayContent || (
        <EmptyContentPlaceholder>
          {t('public_notes_will_appear_here')}
        </EmptyContentPlaceholder>
      )}
    </div>
  );
}

function FooterRenderer({ block }: { block: FooterBlock }) {
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
        textAlign: asTextAlign(align),
        lineHeight,
        padding,
        height: '100%',
        whiteSpace: 'pre-line',
      }}
    >
      {displayContent || (
        <EmptyContentPlaceholder>
          {t('footer_will_appear_here')}
        </EmptyContentPlaceholder>
      )}
    </div>
  );
}

function TermsRenderer({ block }: { block: TermsBlock }) {
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
        textAlign: asTextAlign(align),
        lineHeight,
        padding,
        height: '100%',
        whiteSpace: 'pre-line',
      }}
    >
      {displayContent || (
        <EmptyContentPlaceholder>
          {t('terms_will_appear_here')}
        </EmptyContentPlaceholder>
      )}
    </div>
  );
}

function TableBlockRenderer({ block }: { block: TableLikeBlock }) {
  const sampleData = useSampleInvoiceData();
  const {
    columns = [],
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

  return (
    <div className="w-full h-full overflow-auto">
      <table
        className="w-full"
        style={{
          borderCollapse: 'collapse',
          fontSize: fontSize || undefined,
        }}
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

function TotalBlockRenderer({ block }: { block: TotalBlock }) {
  const { t } = useTranslation();
  const sampleData = useSampleInvoiceData();
  const {
    items = [],
    align,
    labelAlign,
    valueAlign,
    spacing,
    padding,
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
          {items.map((item: TotalItem, index: number) => {
              const displayValue = replaceVariables(item.field, sampleData);

              const ls = item.labelStyle;
              const vs = item.valueStyle;

              const labelFontSize = ls?.fontSize || item.fontSize;
              const labelFontWeight = ls?.fontWeight || item.fontWeight;
              const labelFontStyle = ls?.fontStyle || item.fontStyle;
              const labelTextColor =
                ls?.color || item.color || DEFAULT_LABEL_TEXT_COLOR;

              const valueFontSize = vs?.fontSize || item.fontSize;
              const valueFontWeight = vs?.fontWeight || item.fontWeight;
              const valueFontStyle = vs?.fontStyle || item.fontStyle;
              const valueTextColor =
                vs?.color || item.amountColor || DEFAULT_VALUE_TEXT_COLOR;

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
          })}
        </tbody>
      </table>
    </div>
  );
}

function DividerBlockRenderer({ block }: { block: DividerBlock }) {
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

function SpacerBlockRenderer({ block }: { block: SpacerBlock }) {
  const { height } = block.properties;

  return <div style={{ height }} />;
}

function QRCodeBlockRenderer({ block }: { block: QRCodeBlock }) {
  const { t } = useTranslation();
  const colors = useColorScheme();
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
    <div style={{ textAlign: asTextAlign(align) }}>
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: colors.$23,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${colors.$24}`,
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <span
          className="text-xs font-medium"
          style={{ color: colors.$17 }}
        >
          {getQrLabel()}
        </span>
        <span className="text-[10px]" style={{ color: colors.$17 }}>
          {size}
        </span>
      </div>
    </div>
  );
}
