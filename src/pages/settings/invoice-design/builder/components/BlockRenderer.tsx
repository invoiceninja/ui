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

interface BlockRendererProps {
  block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'text':
      return <TextBlockRenderer block={block} />;

    case 'logo':
    case 'image':
      return <ImageBlockRenderer block={block} />;

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

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        textAlign: align,
        lineHeight,
      }}
    >
      {content || 'Enter text...'}
    </div>
  );
}

function ImageBlockRenderer({ block }: BlockRendererProps) {
  const { source, align, maxWidth, objectFit } = block.properties;

  return (
    <div style={{ textAlign: align, height: '100%', display: 'flex', alignItems: 'center' }}>
      {source ? (
        <img
          src={source}
          alt="Block image"
          style={{ maxWidth, objectFit, maxHeight: '100%' }}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
          {block.type === 'logo' ? 'Company Logo' : 'Image'}
        </div>
      )}
    </div>
  );
}

function CompanyInfoRenderer({ block }: BlockRendererProps) {
  const { content, fontSize, lineHeight, align, color } = block.properties;

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
      {content}
    </div>
  );
}

function ClientInfoRenderer({ block }: BlockRendererProps) {
  const { content, fontSize, lineHeight, align, color, showTitle, title, titleFontWeight } =
    block.properties;

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
        {content}
      </div>
    </div>
  );
}

function InvoiceDetailsRenderer({ block }: BlockRendererProps) {
  const { content, fontSize, lineHeight, align, color } = block.properties;

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
      {content}
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
  } = block.properties;

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
          {/* Sample rows */}
          <tr>
            {columns.map((col: any) => (
              <td
                key={col.id}
                style={{
                  padding,
                  textAlign: col.align,
                  border: showBorders ? `1px solid ${borderColor}` : 'none',
                }}
              >
                Sample
              </td>
            ))}
          </tr>
          <tr style={{ backgroundColor: block.properties.alternateRows ? block.properties.alternateRowBg : block.properties.rowBg }}>
            {columns.map((col: any) => (
              <td
                key={col.id}
                style={{
                  padding,
                  textAlign: col.align,
                  border: showBorders ? `1px solid ${borderColor}` : 'none',
                }}
              >
                Data
              </td>
            ))}
          </tr>
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
  } = block.properties;

  return (
    <div style={{ textAlign: align }}>
      {items
        .filter((item: any) => item.show)
        .map((item: any, index: number) => {
          const isTotal = item.isTotal;
          const isBalance = item.isBalance;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '20px',
                marginBottom: spacing,
                fontSize: isTotal ? totalFontSize : fontSize,
                fontWeight: isTotal ? totalFontWeight : 'normal',
              }}
            >
              <span style={{ color: labelColor }}>{item.label}:</span>
              <span
                style={{
                  color: isBalance ? balanceColor : isTotal ? totalColor : amountColor,
                  minWidth: '100px',
                  textAlign: 'right',
                }}
              >
                {item.field}
              </span>
            </div>
          );
        })}
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
