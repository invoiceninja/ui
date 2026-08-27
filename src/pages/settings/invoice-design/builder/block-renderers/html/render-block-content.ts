/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

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
  SignatureBlock,
  SpacerBlock,
  TableBlock,
  TasksTableBlock,
  TermsBlock,
  TextBlock,
  TotalBlock,
  TotalItem,
} from '../../types';
import {
  InvoiceData,
  replaceVariables,
  resolveVariable,
} from '../../utils/variable-replacer';
import { getSampleLabelValue, replaceLabelVariables } from '../../utils/label-variables';
import { t } from 'i18next';
import {
  resolveTableBorderProps,
  tableHeaderCellBorderCssFragments,
  tableBodyCellBorderCssFragments,
} from '../../utils/table-cell-borders';
import {
  DEFAULT_LABEL_TEXT_COLOR,
  DEFAULT_VALUE_TEXT_COLOR,
} from '../../constants/design-colors';
import { ensurePx, escapeHtml, pick } from '../shared/style-utils';
import { resolveFlexJustifyContent } from '../shared/field-configs';
import { GeneratorGlobals } from '../types';

/**
 * Render block content based on type
 */
export function renderBlockContent(
  block: Block,
  previewData: InvoiceData | undefined,
  layoutData: InvoiceData,
  globals: GeneratorGlobals
): string {
  switch (block.type) {
    case 'text':
    case 'public-notes':
    case 'footer':
    case 'terms':
      return renderTextBlock(block, previewData, globals);
    case 'logo':
    case 'image':
      return renderImageBlock(block, previewData);
    case 'company-info':
      return renderCompanyInfoBlock(block, previewData, globals);
    case 'client-info':
    case 'client-shipping-info':
      return renderClientInfoBlock(block, previewData, globals);
    case 'invoice-details':
      return renderInvoiceDetailsBlock(block, previewData, globals);
    case 'table':
    case 'tasks-table':
      return renderTableBlock(block, previewData, layoutData, globals);
    case 'total':
      return renderTotalBlock(block, previewData, globals);
    case 'divider':
      return renderDividerBlock(block);
    case 'spacer':
      return renderSpacerBlock(block);
    case 'qrcode':
      return renderQRCodeBlock(block, previewData);
    case 'signature':
      return renderSignatureBlock(block, globals);
    default:
      return `<div style="padding: 10px; color: #999;">Unknown block type: ${escapeHtml(
        (block as Block).type
      )}</div>`;
  }
}

function renderTextBlock(
  block: TextBlock | PublicNotesBlock | FooterBlock | TermsBlock,
  data: InvoiceData | undefined,
  globals: GeneratorGlobals
): string {
  const { content, fontSize, fontWeight, color, align, lineHeight, padding } =
    block.properties;
  const replacedContent = replaceVariables(content || '', data);
  const paddingCss = padding ? `padding: ${padding};` : '';
  const fontSizeCss = fontSize ? `font-size: ${fontSize};` : '';

  return `
    <div style="
      ${fontSizeCss}
      font-weight: ${fontWeight || 'normal'};
      color: ${pick(color, DEFAULT_VALUE_TEXT_COLOR, globals.primaryColor)};
      text-align: ${align || 'left'};
      line-height: ${lineHeight || '1.5'};
      ${paddingCss}
      height: 100%;
      display: flex;
      align-items: center;
    ">
      ${escapeHtml(replacedContent)}
    </div>
  `;
}

function renderImageBlock(
  block: ImageBlock | LogoBlock,
  data: InvoiceData | undefined
): string {
  const { source, align, maxWidth, objectFit } = block.properties;
  const resolvedSource = replaceVariables(source || '', data);

  if (!resolvedSource) {
    return `<div style="width: 100%; height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">
      ${block.type === 'logo' ? 'Company Logo' : 'Image'}
    </div>`;
  }

  const justifyContent = resolveFlexJustifyContent(align);

  return `
    <div style="text-align: ${align}; height: 100%; display: flex; align-items: center; justify-content: ${justifyContent};">
      <img src="${escapeHtml(
        resolvedSource
      )}" style="max-width: ${maxWidth}; max-height: 100%; object-fit: ${objectFit};" alt="${
    escapeHtml(block.type)
  }" />
    </div>
  `;
}

function renderCompanyInfoBlock(
  block: CompanyInfoBlock,
  data: InvoiceData | undefined,
  globals: GeneratorGlobals
): string {
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
  const blockFontSize = fontSize;
  const blockFontSizeStyle = blockFontSize
    ? `font-size: ${blockFontSize};`
    : '';
  const blockColor = pick(
    color,
    DEFAULT_VALUE_TEXT_COLOR,
    globals.primaryColor
  );
  const paddingStyle = padding ? `padding: ${padding};` : '';
  const titleFontSizeStyle = titleFontSize
    ? `font-size:${titleFontSize};`
    : blockFontSizeStyle;
  const titleFontStyleCss = titleFontStyle
    ? `font-style:${titleFontStyle};`
    : '';
  const titleTextColor = pick(titleColor, blockColor);
  const titleTextAlign = titleAlign || align || 'left';
  const titleText = `${titlePrefix || ''}${title || ''}${titleSuffix || ''}`;
  const titleHtml = showTitle
    ? `<div style="font-family:${
        globals.fontFamilySecondary
      };${titleFontSizeStyle}font-weight:${
        titleFontWeight || 'bold'
      };${titleFontStyleCss}color:${titleTextColor};text-align:${titleTextAlign};margin-bottom:8px;">${escapeHtml(
        titleText
      )}</div>`
    : '';

  if (fieldConfigs && Array.isArray(fieldConfigs) && fieldConfigs.length > 0) {
    const fieldsHtml = fieldConfigs
      .map(
        (config: {
          variable: string;
          prefix?: string;
          suffix?: string;
          hideIfEmpty?: boolean;
          fontSize?: string;
          fontWeight?: string;
          fontStyle?: string;
          color?: string;
        }) => {
          const resolvedValue = replaceVariables(config.variable, data);

          if (
            config.hideIfEmpty !== false &&
            (!resolvedValue || resolvedValue.trim() === '')
          ) {
            return '';
          }

          const fieldFontSizeStyle = config.fontSize
            ? `font-size: ${config.fontSize};`
            : '';
          const fieldColor = pick(config.color, blockColor);

          return `
          <div style="
            ${fieldFontSizeStyle}
            font-weight: ${config.fontWeight || 'normal'};
            color: ${fieldColor};
            font-style: ${config.fontStyle || 'normal'};
          ">
            ${escapeHtml(config.prefix || '')}${escapeHtml(
            resolvedValue
          )}${escapeHtml(config.suffix || '')}
          </div>
        `;
        }
      )
      .filter(Boolean)
      .join('');

    if (!fieldsHtml) {
      return '<div>&nbsp;</div>';
    }

    return `
      <div style="
        ${blockFontSizeStyle}
        line-height: ${lineHeight || '1.5'};
        text-align: ${align || 'left'};
        color: ${blockColor};
        ${paddingStyle}
      ">
        ${titleHtml}
        ${fieldsHtml}
      </div>
    `;
  }

  const replacedContent = replaceVariables(content || '', data);

  return `
    <div style="
      ${blockFontSizeStyle}
      line-height: ${lineHeight || '1.5'};
      text-align: ${align || 'left'};
      color: ${blockColor};
      white-space: pre-line;
      ${paddingStyle}
    ">
      ${titleHtml}
      ${escapeHtml(replacedContent)}
    </div>
  `;
}

function renderClientInfoBlock(
  block: ClientInfoBlock | ClientShippingInfoBlock,
  data: InvoiceData | undefined,
  globals: GeneratorGlobals
): string {
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
  const blockFontSize = fontSize;
  const blockFontSizeStyle = blockFontSize
    ? `font-size:${blockFontSize};`
    : '';
  const blockColor = pick(
    color,
    DEFAULT_VALUE_TEXT_COLOR,
    globals.primaryColor
  );
  const paddingStyle = padding ? `padding:${padding};` : '';

  let contentHtml = '';
  let useFieldConfigs = false;

  if (fieldConfigs && Array.isArray(fieldConfigs) && fieldConfigs.length > 0) {
    useFieldConfigs = true;
    const fieldsHtml = fieldConfigs
      .map(
        (config: {
          variable: string;
          prefix?: string;
          suffix?: string;
          hideIfEmpty?: boolean;
          fontSize?: string;
          fontWeight?: string;
          fontStyle?: string;
          color?: string;
        }) => {
          const resolvedValue = replaceVariables(config.variable, data);

          if (
            config.hideIfEmpty !== false &&
            (!resolvedValue || resolvedValue.trim() === '')
          ) {
            return '';
          }

          const fieldFontSizeStyle = config.fontSize
            ? `font-size:${config.fontSize};`
            : '';
          const fieldColor = pick(config.color, blockColor);

          return `<div style="${fieldFontSizeStyle}font-weight:${
            config.fontWeight || 'normal'
          };color:${fieldColor};font-style:${
            config.fontStyle || 'normal'
          };">${escapeHtml(config.prefix || '')}${escapeHtml(
            resolvedValue
          )}${escapeHtml(config.suffix || '')}</div>`;
        }
      )
      .filter(Boolean)
      .join('');

    contentHtml = fieldsHtml || '<div>&nbsp;</div>';
  } else {
    const replacedContent = replaceVariables(content || '', data);
    contentHtml = escapeHtml(replacedContent);
  }

  const whiteSpaceRule = useFieldConfigs ? '' : 'white-space: pre-line;';
  const titleFontSizeStyle = titleFontSize
    ? `font-size:${titleFontSize};`
    : blockFontSizeStyle;
  const titleFontStyleCss = titleFontStyle
    ? `font-style:${titleFontStyle};`
    : '';
  const titleTextColor = pick(titleColor, blockColor);
  const titleTextAlign = titleAlign || align || 'left';
  const titleText = `${titlePrefix || ''}${title || ''}${titleSuffix || ''}`;

  return `
    <div style="${paddingStyle}">
      ${
        showTitle
          ? `<div style="font-family:${
              globals.fontFamilySecondary
            };${titleFontSizeStyle}font-weight:${
              titleFontWeight || 'bold'
            };${titleFontStyleCss}color:${titleTextColor};text-align:${titleTextAlign};margin-bottom:8px;">${escapeHtml(
              titleText
            )}</div>`
          : ''
      }
      <div style="${blockFontSizeStyle}line-height:${
    lineHeight || '1.5'
  };text-align:${
    align || 'left'
  };color:${blockColor};${whiteSpaceRule}">${contentHtml}</div>
    </div>
  `;
}

function renderInvoiceDetailsBlock(
  block: InvoiceDetailsBlock,
  data: InvoiceData | undefined,
  globals: GeneratorGlobals
): string {
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
  const blockColor = pick(
    color,
    DEFAULT_VALUE_TEXT_COLOR,
    globals.primaryColor
  );
  const blockLabelColor = pick(
    labelColor,
    DEFAULT_LABEL_TEXT_COLOR,
    blockColor
  );
  const paddingStyle = padding ? `padding:${padding};` : '';

  const tableAlign =
    align === 'right' ? 'right' : align === 'center' ? 'center' : 'left';
  const tableWidth = tableAlign === 'left' ? '100%' : 'auto';
  const tableMargin =
    tableAlign === 'right'
      ? 'margin-left:auto;'
      : tableAlign === 'center'
      ? 'margin-left:auto;margin-right:auto;'
      : '';
  const tableFontSizeCss = fontSize ? `font-size:${fontSize};` : '';

  const colLabelAlign = labelAlign || 'right';
  const colValueAlign = valueAlign || 'right';
  const gap = ensurePx(labelValueGap) || '12px';
  const labelPadValue = ensurePx(labelPadding);
  const valuePadValue = ensurePx(valuePadding);
  const rowSpacingValue = ensurePx(rowSpacing);
  const valueMinWidthValue = ensurePx(valueMinWidth);
  const labelPadCss = labelPadValue
    ? `padding:${labelPadValue};padding-right:${gap};`
    : `padding:0;padding-right:${gap};`;
  const valuePadCss = valuePadValue
    ? `padding:${valuePadValue};`
    : 'padding:0;';
  const rowSpacingCss = rowSpacingValue
    ? `padding-bottom:${rowSpacingValue};`
    : '';
  const valueMinWidthCss = valueMinWidthValue
    ? `min-width:${valueMinWidthValue};`
    : '';

  const rowsHtml =
    fieldConfigs
      ?.map((field: FieldConfig) => {
        const displayValue = replaceVariables(field.variable, data);

        if (
          field.hideIfEmpty !== false &&
          (!displayValue || displayValue.trim() === '')
        ) {
          return '';
        }

        const ls = field.labelStyle;
        const vs = field.valueStyle;
        const labelFontSize = pick(ls?.fontSize, field.fontSize);
        const labelFontWeight = ls?.fontWeight || field.fontWeight || 'normal';
        const labelFontStyle = ls?.fontStyle || field.fontStyle || 'normal';
        const labelTextColor = pick(ls?.color, field.color, blockLabelColor);

        const valueFontSize = pick(vs?.fontSize, field.fontSize);
        const valueFontWeight = vs?.fontWeight || field.fontWeight || 'normal';
        const valueFontStyle = vs?.fontStyle || field.fontStyle || 'normal';
        const valueTextColor = pick(vs?.color, field.color, blockColor);

        const labelSource =
          field.label || (field.prefix || '').replace(/:\s*$/, '');
        const labelText = data
          ? replaceLabelVariables(labelSource, t)
          : labelSource;
        const valueText = `${displayValue}${field.suffix || ''}`;

        const labelCellBase = `${
          labelFontSize ? `font-size:${labelFontSize};` : ''
        }font-weight:${labelFontWeight};font-style:${labelFontStyle};`;
        const valueCellBase = `${
          valueFontSize ? `font-size:${valueFontSize};` : ''
        }font-weight:${valueFontWeight};font-style:${valueFontStyle};`;

        const labelCell =
          showLabels !== false
            ? `<td style="${labelCellBase}color:${labelTextColor};${labelPadCss}${rowSpacingCss}white-space:nowrap;text-align:${colLabelAlign};">${escapeHtml(
                labelText
              )}</td>`
            : '';

        return `<tr>${labelCell}<td style="${valueCellBase}color:${valueTextColor};${valuePadCss}${rowSpacingCss}${valueMinWidthCss}text-align:${colValueAlign};">${escapeHtml(
          valueText
        )}</td></tr>`;
      })
      .filter(Boolean)
      .join('') || '';

  return `
    <div style="${paddingStyle}">
      <table style="border-collapse:collapse;width:${tableWidth};${tableMargin}${tableFontSizeCss}line-height:${
    lineHeight || '1.5'
  };color:${blockColor};">
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

function renderTableBlock(
  block: TableBlock | TasksTableBlock,
  previewData: InvoiceData | undefined,
  layoutData: InvoiceData,
  globals: GeneratorGlobals
): string {
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
  const tableFontSizeStyle = fontSize ? `font-size: ${fontSize};` : '';
  const resolvedRowTextColor = pick(rowColor, DEFAULT_VALUE_TEXT_COLOR);

  const borderResolved = resolveTableBorderProps(block.properties);
  let headerHTML =
    '<thead><tr style="font-family: ' +
    globals.fontFamilySecondary +
    '; background: ' +
    headerBg +
    '; color: ' +
    headerColor +
    '; font-weight: ' +
    headerFontWeight +
    ';">';
  columns.forEach(
    (
      col: {
        id: string;
        header: string;
        align: string;
        width: string;
        field: string;
      },
      colIndex: number
    ) => {
      const headerBorderCss = tableHeaderCellBorderCssFragments(
        borderResolved,
        colIndex,
        columns.length
      );

      headerHTML += `
      <th style="
        padding: ${padding};
        text-align: ${col.align};
        width: ${col.width};
        ${headerBorderCss}
      ">
        ${escapeHtml(col.header)}
      </th>
    `;
    }
  );
  headerHTML += '</tr></thead>';

  let rowsHTML = '<tbody>';
  const rowItems = previewData ? layoutData.line_items : [null];
  rowItems.forEach((item, index) => {
    const rowBackground =
      alternateRows && index % 2 === 1 ? alternateRowBg : rowBg;
    rowsHTML += `<tr style="background: ${rowBackground};">`;

    columns.forEach(
      (col: { id: string; align: string; field: string }, colIndex: number) => {
        const cellBorderCss = tableBodyCellBorderCssFragments(
          borderResolved,
          index,
          colIndex,
          columns.length
        );
        const value = resolveVariable(col.field, item, previewData);
        rowsHTML += `
        <td style="
          padding: ${padding};
          text-align: ${col.align};
          color: ${resolvedRowTextColor};
          ${cellBorderCss}
        ">
          ${escapeHtml(value)}
        </td>
      `;
      }
    );

    rowsHTML += '</tr>';
  });
  rowsHTML += '</tbody>';

  const wrapperStyle = globals.fullDocument
    ? 'width: 100%;'
    : 'width: 100%; height: 100%; overflow: auto;';

  return `
    <div style="${wrapperStyle}">
      <table style="width: 100%; border-collapse: collapse; ${tableFontSizeStyle}">
        ${headerHTML}
        ${rowsHTML}
      </table>
    </div>
  `;
}

function renderTotalBlock(
  block: TotalBlock,
  data: InvoiceData | undefined,
  globals: GeneratorGlobals
): string {
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
  const blockPaddingStyle = padding ? `padding:${padding};` : '';
  const colLabelAlign = labelAlign || 'right';
  const colValueAlign = valueAlign || 'right';

  const tableAlign =
    align === 'right'
      ? 'margin-left: auto;'
      : align === 'center'
      ? 'margin: 0 auto;'
      : '';
  const gap = ensurePx(labelValueGap) || '20px';
  const labelPaddingPx = ensurePx(labelPadding);
  const valuePaddingPx = ensurePx(valuePadding);
  const spacingPx = ensurePx(spacing);
  const valueMinWidthPx = ensurePx(valueMinWidth);
  const minWidthStyle = valueMinWidthPx ? `min-width: ${valueMinWidthPx};` : '';

  let html = `<div style="${blockPaddingStyle}"><table style="border-collapse: collapse; ${tableAlign}">`;
  html += '<tbody>';

  items.forEach((item: TotalItem) => {
      const value = replaceVariables(item.field, data);

      const ls = item.labelStyle;
      const vs = item.valueStyle;

      const labelFontSize = pick(ls?.fontSize, item.fontSize);
      const labelFontWeight = ls?.fontWeight || item.fontWeight || 'normal';
      const labelFontStyle = ls?.fontStyle || item.fontStyle || 'normal';
      const labelTextColor = ls?.color || item.color || DEFAULT_LABEL_TEXT_COLOR;

      const valueFontSize = pick(vs?.fontSize, item.fontSize);
      const valueFontWeight = vs?.fontWeight || item.fontWeight || 'normal';
      const valueFontStyle = vs?.fontStyle || item.fontStyle || 'normal';
      const valueTextColor =
        vs?.color || item.amountColor || DEFAULT_VALUE_TEXT_COLOR;

      const labelPaddingStyle = labelPaddingPx
        ? `padding: ${labelPaddingPx}; padding-right: ${gap};`
        : `padding-right: ${gap}; padding-bottom: ${spacingPx || '0px'};`;

      const valuePaddingStyle = valuePaddingPx
        ? `padding: ${valuePaddingPx};`
        : `padding-bottom: ${spacingPx || '0px'};`;

      let displayLabel = item.label;
      if (data) {
        displayLabel = getSampleLabelValue(item.label, t);
      }

      html += `
        <tr>
          <td style="
            ${labelFontSize ? `font-size: ${labelFontSize};` : ''}
            font-weight: ${labelFontWeight};
            font-style: ${labelFontStyle};
            color: ${labelTextColor};
            ${labelPaddingStyle}
            text-align: ${colLabelAlign};
            white-space: nowrap;
          ">${escapeHtml(displayLabel)}:</td>
          <td style="
            ${valueFontSize ? `font-size: ${valueFontSize};` : ''}
            font-weight: ${valueFontWeight};
            font-style: ${valueFontStyle};
            color: ${valueTextColor};
            ${valuePaddingStyle}
            text-align: ${colValueAlign};
            white-space: nowrap;
            ${minWidthStyle}
          ">${escapeHtml(value)}</td>
        </tr>
      `;
  });

  html += '</tbody></table></div>';

  if (globals.showPaidStamp) {
    html += `
      <div class="stamp is-paid" style="display: flex; justify-content: center; align-items: center; margin-top: 1rem;">
        PAID
      </div>
    `;
  }

  return html;
}

function renderDividerBlock(block: DividerBlock): string {
  const { thickness, color, style, marginTop, marginBottom } = block.properties;

  return `
    <hr style="
      border: none;
      border-top: ${thickness} ${style} ${color};
      margin-top: ${marginTop};
      margin-bottom: ${marginBottom};
    " />
  `;
}

function renderSpacerBlock(block: SpacerBlock): string {
  const { height } = block.properties;
  return `<div style="height: ${height};"></div>`;
}

function renderQRCodeBlock(
  block: QRCodeBlock,
  _data: InvoiceData | undefined
): string {
  const { size, align } = block.properties;

  return `
    <div style="text-align: ${align};">
      <div style="
        width: ${size};
        height: ${size};
        background: #f3f4f6;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #e5e7eb;
      ">
        <span style="color: #9ca3af; font-size: 12px;">QR Code</span>
      </div>
    </div>
  `;
}

function renderSignatureBlock(
  block: SignatureBlock,
  globals: GeneratorGlobals
): string {
  const {
    label,
    showDate,
    align,
    fontSize,
    fontWeight,
    fontStyle,
    color,
    padding,
  } = block.properties;
  const showLine = block.properties.showLine !== false;
  const signatureHeight = ensurePx(block.properties.signatureHeight) || '40px';
  const lineWidth = ensurePx(block.properties.lineWidth) || '200px';
  const lineThickness = ensurePx(block.properties.lineThickness) || '1px';
  const lineStyleProp = block.properties.lineStyle;
  const lineStyle = ['solid', 'dashed', 'dotted'].includes(lineStyleProp || '')
    ? lineStyleProp
    : 'solid';
  const lineColor = block.properties.lineColor || '#000000';
  const sigFontSizeStyle = fontSize ? `font-size: ${fontSize};` : '';
  const sigFontWeightStyle = fontWeight
    ? `font-weight: ${fontWeight};`
    : '';
  const sigFontStyleStyle = fontStyle ? `font-style: ${fontStyle};` : '';
  const sigColor = pick(color, DEFAULT_VALUE_TEXT_COLOR, globals.primaryColor);
  const paddingStyle = padding ? `padding: ${ensurePx(padding)};` : '';

  return `
    <div style="text-align: ${
      align || 'left'
    }; ${paddingStyle} box-sizing: border-box;">
      <div aria-hidden="true" style="height: ${signatureHeight};"></div>
      ${
        showLine
          ? `
        <div style="
          border-top: ${lineThickness} ${lineStyle} ${lineColor};
          width: ${lineWidth};
          max-width: 100%;
          margin-bottom: 8px;
          display: inline-block;
        "></div>
      `
          : ''
      }
      <div style="${sigFontSizeStyle} ${sigFontWeightStyle} ${sigFontStyleStyle} color: ${sigColor};">
        ${escapeHtml(label)}
      </div>
      ${
        showDate
          ? `
        <div style="${sigFontSizeStyle} ${sigFontWeightStyle} ${sigFontStyleStyle} color: ${sigColor}; margin-top: 4px;">
          ${escapeHtml(t('date') || 'Date')}: ________________
        </div>
      `
          : ''
      }
    </div>
  `;
}
