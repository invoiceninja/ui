/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Button } from '$app/components/forms';
import { PropertyPanelProps, Block, DividerBlock, SpacerBlock } from '../types';
import { useBlockLabel, useBlockDescription } from '../block-library';
import { useColorScheme } from '$app/common/colors';
import { TextBlockProperties } from './properties/TextBlockProperties';
import { ImageBlockProperties } from './properties/ImageBlockProperties';
import { TableBlockProperties } from './properties/TableBlockProperties';
import { TotalBlockProperties } from './properties/TotalBlockProperties';
import { CompanyInfoBlockProperties } from './properties/CompanyInfoBlockProperties';
import { ClientInfoBlockProperties } from './properties/ClientInfoBlockProperties';
import { ClientShippingInfoBlockProperties } from './properties/ClientShippingInfoBlockProperties';
import { InvoiceDetailsBlockProperties } from './properties/InvoiceDetailsBlockProperties';
import { QRCodeBlockProperties } from './properties/QRCodeBlockProperties';
import { SignatureBlockProperties } from './properties/SignatureBlockProperties';
import { TextInput, ColorInput, SelectInput } from './properties/PropertyInputs';
import {
  INVOICE_WIDGET_CLASS,
  INVOICE_WIDGET_CLASS_BY_TYPE,
} from '../constants/widget-classes';

export function PropertyPanel({
  block,
  onChange,
  onDelete,
}: PropertyPanelProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const blockLabel = useBlockLabel(block.type);
  const blockDescription = useBlockDescription(block.type);

  return (
    <div className="p-4 space-y-6">
      {/* Header with Title and Copy Button */}
      <div
        className="flex items-start justify-between gap-2 pb-4 border-b"
        style={{ borderColor: colors.$24 }}
      >
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-lg mb-1"
            style={{ color: colors.$3 }}
          >
            {blockLabel}
          </h3>
          <p className="text-sm" style={{ color: colors.$17 }}>
            {blockDescription}
          </p>
        </div>
        {/* Duplicate block button - temporarily disabled
        <Button
          behavior="button"
          type="minimal"
          onClick={onDuplicate}
          className="flex-shrink-0 p-2"
        >
          <Clipboard className="w-4 h-4" />
        </Button>
        */}
      </div>

      {/* Block-specific properties */}
      <div className="space-y-4">
        {(block.type === 'text' ||
          block.type === 'public-notes' ||
          block.type === 'footer' ||
          block.type === 'terms') && (
          <TextBlockProperties block={block} onChange={onChange} />
        )}

        {block.type === 'company-info' && (
          <CompanyInfoBlockProperties block={block} onChange={onChange} />
        )}

        {block.type === 'client-info' && (
          <ClientInfoBlockProperties block={block} onChange={onChange} />
        )}

        {block.type === 'client-shipping-info' && (
          <ClientShippingInfoBlockProperties
            block={block}
            onChange={onChange}
          />
        )}

        {block.type === 'invoice-details' && (
          <InvoiceDetailsBlockProperties block={block} onChange={onChange} />
        )}

        {(block.type === 'logo' || block.type === 'image') && (
          <ImageBlockProperties block={block} onChange={onChange} />
        )}

        {(block.type === 'table' || block.type === 'tasks-table') && (
          <TableBlockProperties block={block} onChange={onChange} />
        )}

        {block.type === 'total' && (
          <TotalBlockProperties block={block} onChange={onChange} />
        )}

        {block.type === 'divider' && (
          <DividerProperties block={block} onChange={onChange} />
        )}

        {block.type === 'spacer' && (
          <SpacerProperties block={block} onChange={onChange} />
        )}

        {block.type === 'qrcode' && (
          <QRCodeBlockProperties block={block} onChange={onChange} />
        )}

        {block.type === 'signature' && (
          <SignatureBlockProperties block={block} onChange={onChange} />
        )}
      </div>

      <div
        className="space-y-3 border-t pt-4"
        style={{ borderColor: colors.$24 }}
      >
        <div>
          <h4 className="text-sm font-medium" style={{ color: colors.$3 }}>
            {String(t('css_classes', { defaultValue: 'CSS classes' }))}
          </h4>
          <p className="mt-1 text-xs leading-5" style={{ color: colors.$17 }}>
            Built-in selectors remain available on this widget. Add class names
            without a leading dot, separated by spaces.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[INVOICE_WIDGET_CLASS, INVOICE_WIDGET_CLASS_BY_TYPE[block.type]].map(
            (className) => (
              <code
                key={className}
                className="select-all break-all rounded px-1.5 py-1 text-xs"
                style={{ backgroundColor: colors.$20, color: colors.$16 }}
              >
                .{className}
              </code>
            )
          )}
        </div>

        <TextInput
          label={String(
            t('additional_css_classes', {
              defaultValue: 'Additional CSS classes',
            })
          )}
          value={block.properties.cssClasses}
          placeholder="compact highlighted"
          changeOverride
          debounceTimeout={0}
          onChange={(cssClasses) =>
            onChange({
              ...block,
              properties: { ...block.properties, cssClasses },
            })
          }
        />
      </div>

      {/* Actions */}
      <div className="pt-4 border-t">
        <Button
          type="secondary"
          behavior="button"
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4" />
          {t('delete')}
        </Button>
      </div>
    </div>
  );
}

// Simple property editors for basic block types
interface DividerPropertiesProps {
  block: DividerBlock;
  onChange: (block: Block) => void;
}

function DividerProperties({ block, onChange }: DividerPropertiesProps) {
  const [t] = useTranslation();

  return (
    <div className="space-y-4">
      <TextInput
        label={String(t('width'))}
        value={block.properties.thickness}
        onChange={(thickness) =>
          onChange({
            ...block,
            properties: { ...block.properties, thickness },
          })
        }
      />

      <ColorInput
        label={String(t('color'))}
        value={block.properties.color}
        onChange={(color) =>
          onChange({
            ...block,
            properties: { ...block.properties, color },
          })
        }
      />

      <SelectInput
        label={String(t('style'))}
        value={block.properties.style}
        onChange={(style) =>
          onChange({
            ...block,
            properties: { ...block.properties, style },
          })
        }
        options={[
          { value: 'solid', label: String(t('solid')) },
          { value: 'dashed', label: String(t('dashed')) },
          { value: 'dotted', label: String(t('dotted')) },
        ]}
      />
    </div>
  );
}

interface SpacerPropertiesProps {
  block: SpacerBlock;
  onChange: (block: Block) => void;
}

function SpacerProperties({ block, onChange }: SpacerPropertiesProps) {
  const [t] = useTranslation();

  return (
    <TextInput
      label={String(t('height'))}
      value={block.properties.height}
      placeholder={String(t('height_placeholder_example'))}
      onChange={(height) =>
        onChange({
          ...block,
          properties: { ...block.properties, height },
        })
      }
    />
  );
}
