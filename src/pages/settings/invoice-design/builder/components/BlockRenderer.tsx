/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Block } from '../types';
import { getBlockLabel } from '../block-library';
import { SAMPLE_INVOICE_DATA, replaceVariables } from '../utils/variable-replacer';
import { useLogo } from '$app/common/hooks/useLogo';

interface BlockRendererProps {
  block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  const companyLogo = useLogo();
  
  switch (block.type) {
    case 'text':
      return <TextBlockRenderer block={block} />;

    case 'logo':
    case 'image':
      return <ImageBlockRenderer block={block} companyLogo={companyLogo} />;

    case 'company-info':
      return <CompanyInfoRenderer block={block} />;

    case 'client-info':
      return <ClientInfoRenderer block={block} />;

    case 'invoice-details':
      return <InvoiceDetailsRenderer block={block} />;

    case 'table':
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
          {getBlockLabel(block.type)}
        </div>
      );
  }
}

// Individual block renderers
function TextBlockRenderer({ block }: BlockRendererProps) {
  const { content, fontSize, fontWeight, color, align, lineHeight } = block.properties;
  const displayContent = replaceVariables(content || 'Enter text...', SAMPLE_INVOICE_DATA);

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

interface ImageBlockRendererProps extends BlockRendererProps {
  companyLogo?: string;
}

function ImageBlockRenderer({ block, companyLogo }: ImageBlockRendererProps) {
  const { source, align, maxWidth, objectFit } = block.properties;
  
  // If source is $company.logo, use the actual company logo
  let resolvedSource = source;
  if (source === '$company.logo' && companyLogo) {
    resolvedSource = companyLogo;
  } else {
    resolvedSource = replaceVariables(source, SAMPLE_INVOICE_DATA);
  }

  return (
    <div style={{ textAlign: align, height: '100%', display: 'flex', alignItems: 'center', justifyContent: align }}>
      {resolvedSource ? (
        <img
          src={resolvedSource}
          alt={block.type === 'logo' ? 'Company Logo' : 'Block image'}
          style={{ maxWidth, objectFit, maxHeight: '100%' }}
        />
      ) : (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 text-xs border-2 border-dashed border-gray-300 rounded">
          {block.type === 'logo' ? 'Company Logo' : 'Image'}
        </div>
      )}
    </div>
  );
}

function CompanyInfoRenderer({ block }: BlockRendererProps) {
  const { content, fontSize, lineHeight, align, color } = block.properties;
  const displayContent = replaceVariables(content, SAMPLE_INVOICE_DATA);

  return (
    <div
      style={{
        fontSize,
        lineHeight,
        textAlign: align,
        color,
        whiteSpace: 'pre-line',
      }}
    >
      {displayContent}
    </div>
  );
}

function ClientInfoRenderer({ block }: BlockRendererProps) {
  const { content, fontSize, lineHeight, align, color, showTitle, title, titleFontWeight } =
    block.properties;
  const displayContent = replaceVariables(content, SAMPLE_INVOICE_DATA);

  return (
    <div>
      {showTitle && (
        <div
          style={{
            fontSize,
            fontWeight: titleFontWeight,
            color,
            marginBottom: '8px',
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          fontSize,
          lineHeight,
          textAlign: align,
          color,
          whiteSpace: 'pre-line',
        }}
      >
        {displayContent}
      </div>
    </div>
  );
}

function InvoiceDetailsRenderer({ block }: BlockRendererProps) {
  const { content, fontSize, lineHeight, align, color } = block.properties;
  const displayContent = replaceVariables(content, SAMPLE_INVOICE_DATA);

  return (
    <div
      style={{
        fontSize,
        lineHeight,
        textAlign: align,
        color,
        whiteSpace: 'pre-line',
      }}
    >
      {displayContent}
    </div>
  );
}

function TableBlockRenderer({ block }: BlockRendererProps) {
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

  const resolveItemValue = (field: string, item: any): string => {
    // Extract field from item.field format (e.g., "item.product_key" -> "product_key")
    const fieldKey = field.startsWith('item.') ? field.replace('item.', '') : field;
    const value = item[fieldKey];

    if (typeof value === 'number') {
      if (fieldKey === 'cost' || fieldKey === 'line_total') {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      }
      return String(value);
    }
    return String(value || '');
  };

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full" style={{ fontSize, borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              backgroundColor: headerBg,
              color: headerColor,
              fontWeight: headerFontWeight,
            }}
          >
            {columns.map((col: any) => (
              <th
                key={col.id}
                style={{
                  padding,
                  textAlign: col.align,
                  width: col.width,
                  border: showBorders ? `1px solid ${borderColor}` : 'none',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SAMPLE_INVOICE_DATA.line_items.map((item, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: alternateRows && index % 2 === 1 ? alternateRowBg : rowBg,
              }}
            >
              {columns.map((col: any) => (
                <td
                  key={col.id}
                  style={{
                    padding,
                    textAlign: col.align,
                    border: showBorders ? `1px solid ${borderColor}` : 'none',
                  }}
                >
                  {resolveItemValue(col.field, item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TotalBlockRenderer({ block }: BlockRendererProps) {
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

  // Use table for proper label/value alignment
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
          .map((item: any, index: number) => {
            const isTotal = item.isTotal;
            const isBalance = item.isBalance;
            const displayValue = replaceVariables(item.field, SAMPLE_INVOICE_DATA);

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
                    paddingRight: gap,
                    paddingBottom: spacing,
                    padding: labelPadding || undefined,
                    paddingRight: gap, // Override right padding with gap
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}:
                </td>
                <td
                  style={{
                    color: isBalance ? balanceColor : isTotal ? totalColor : amountColor,
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
          })}
      </tbody>
    </table>
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
  const { size, align } = block.properties;

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
        }}
      >
        <span className="text-gray-400 text-xs">QR Code</span>
      </div>
    </div>
  );
}

function SignatureBlockRenderer({ block }: BlockRendererProps) {
  const { label, showLine, showDate, align, fontSize, color } = block.properties;

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
      <div style={{ fontSize, color }}>{label}</div>
      {showDate && (
        <div style={{ fontSize, color, marginTop: '4px' }}>
          Date: ________________
        </div>
      )}
    </div>
  );
}
