/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceTemplate } from '../types';
import {
  DEFAULT_LABEL_TEXT_COLOR,
  DEFAULT_VALUE_TEXT_COLOR,
} from '../constants/design-colors';
import { DEFAULT_TABLE_REGION_BORDER_PROPS } from '../utils/table-cell-borders';

export const templates: InvoiceTemplate[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean, contemporary design with bold typography',
    category: 'modern',
    tags: ['Popular', 'Clean', 'Professional'],
    layout: {
      cols: 12,
      rowHeight: 20,
      margin: [10, 10],
      containerPadding: [20, 20],
    },
    blocks: [
      // Header section
      {
        id: 'logo',
        type: 'logo',
        gridPosition: { x: 0, y: 0, w: 4, h: 3 },
        properties: {
          source: '$company.logo',
          align: 'left',
          maxWidth: '180px',
          objectFit: 'contain',
        },
      },
      {
        id: 'company-info',
        type: 'company-info',
        gridPosition: { x: 8, y: 0, w: 4, h: 3 },
        properties: {
          content:
            '$company.name\n$company.address1\n$company.city_state_postal\n$company.phone',
          fontSize: '11px',
          lineHeight: '1.3',
          align: 'right',
          color: '#6B7280',
        },
      },

      // Invoice title
      {
        id: 'invoice-title',
        type: 'text',
        gridPosition: { x: 0, y: 4, w: 6, h: 2 },
        properties: {
          content: '$entity_label',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#111827',
          align: 'left',
        },
      },

      // Entity details
      {
        id: 'entity-details',
        type: 'invoice-details',
        gridPosition: { x: 8, y: 4, w: 4, h: 3 },
        properties: {
          fieldConfigs: [
            {
              id: 'number',
              label: '$number_label',
              variable: '$number',
              prefix: '$number_label: ',
              hideIfEmpty: true,
            },
            {
              id: 'date',
              label: '$date_label',
              variable: '$date',
              prefix: '$date_label: ',
              hideIfEmpty: true,
            },
            {
              id: 'due_date',
              label: '$due_date_label',
              variable: '$due_date',
              prefix: '$due_date_label: ',
              hideIfEmpty: true,
            },
          ],
          fontSize: '11px',
          lineHeight: '1.3',
          align: 'right',
          labelColor: DEFAULT_LABEL_TEXT_COLOR,
          color: DEFAULT_VALUE_TEXT_COLOR,
          showLabels: true,
        },
      },

      // Client info
      {
        id: 'client-info',
        gridPosition: { x: 0, y: 7, w: 6, h: 4 },
        type: 'client-info',
        properties: {
          content: '$client.name\n$client.address\n$client.city_state_postal',
          fontSize: '12px',
          lineHeight: '1.3',
          align: 'left',
          color: DEFAULT_VALUE_TEXT_COLOR,
          showTitle: true,
          title: 'Bill To: ',
          titleFontWeight: 'bold',
        },
      },

      {
        id: 'client-shipping-info',
        gridPosition: { x: 6, y: 7, w: 6, h: 4 },
        type: 'client-shipping-info',
        properties: {
          content:
            '$client.shipping_address1\n$client.shipping_address2\n$client.shipping_city\n$client.shipping_state\n$client.shipping_postal_code\n$client.shipping_country',
          fontSize: '12px',
          lineHeight: '1.3',
          align: 'left',
          color: DEFAULT_VALUE_TEXT_COLOR,
          showTitle: true,
          title: 'Ship To: ',
          titleFontWeight: 'bold',
        },
      },

      // Spacer
      {
        id: 'spacer-1',
        type: 'spacer',
        gridPosition: { x: 0, y: 11, w: 12, h: 1 },
        properties: {
          height: '20px',
        },
      },

      // Line items table
      {
        id: 'line-items',
        type: 'table',
        gridPosition: { x: 0, y: 12, w: 12, h: 10 },
        properties: {
          columns: [
            {
              id: 'notes',
              header: 'Description',
              field: 'item.notes',
              width: '45%',
              align: 'left',
            },
            {
              id: 'quantity',
              header: 'Qty',
              field: 'item.quantity',
              width: '15%',
              align: 'center',
            },
            {
              id: 'cost',
              header: 'Rate',
              field: 'item.cost',
              width: '20%',
              align: 'right',
            },
            {
              id: 'line_total',
              header: 'Line Total',
              field: 'item.line_total',
              width: '20%',
              align: 'right',
            },
          ],
          headerBg: '#111827',
          headerColor: '#FFFFFF',
          headerFontWeight: 'bold',
          rowBg: '#FFFFFF',
          alternateRowBg: '#F9FAFB',
          headerBorders: {
            ...DEFAULT_TABLE_REGION_BORDER_PROPS,
            sides: { ...DEFAULT_TABLE_REGION_BORDER_PROPS.sides },
          },
          rowBorders: {
            ...DEFAULT_TABLE_REGION_BORDER_PROPS,
            sides: { ...DEFAULT_TABLE_REGION_BORDER_PROPS.sides },
          },
          fontSize: '12px',
          padding: '12px',
          showBorders: true,
          alternateRows: true,
          rowColor: DEFAULT_VALUE_TEXT_COLOR,
        },
        locked: false,
      },

      // Totals
      {
        id: 'totals',
        type: 'total',
        gridPosition: { x: 7, y: 22, w: 5, h: 6 },
        properties: {
          items: [
            { label: '$subtotal_label', field: '$subtotal' },
            { label: '$taxes_label', field: '$taxes' },
            {
              label: '$total_label',
              field: '$total',
              isTotal: true,
            },
            { label: '$paid_to_date_label', field: '$paid_to_date' },
            {
              label: '$balance_due_label',
              field: '$balance_due',
              isBalance: true,
            },
          ],
          fontSize: '13px',
          align: 'right',
          labelColor: DEFAULT_LABEL_TEXT_COLOR,
          amountColor: DEFAULT_VALUE_TEXT_COLOR,
          totalFontSize: '20px',
          totalFontWeight: 'bold',
          totalColor: DEFAULT_VALUE_TEXT_COLOR,
          balanceColor: DEFAULT_VALUE_TEXT_COLOR,
          spacing: '10px',
        },
      },

      // Footer
      {
        id: 'footer-text',
        type: 'text',
        gridPosition: { x: 0, y: 28, w: 12, h: 2 },
        properties: {
          content: 'Thank you for your business!',
          fontSize: '12px',
          align: 'center',
          color: '#6B7280',
        },
      },
    ],
  },

  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Simple and elegant with plenty of white space',
    category: 'minimal',
    tags: ['Simple', 'Clean'],
    layout: {
      cols: 12,
      rowHeight: 20,
      margin: [8, 8],
      containerPadding: [30, 30],
    },
    blocks: [
      {
        id: 'company-name',
        type: 'text',
        gridPosition: { x: 0, y: 0, w: 6, h: 2 },
        properties: {
          content: '$company.name',
          fontSize: '24px',
          fontWeight: '600',
          color: '#000000',
          align: 'left',
        },
      },
      {
        id: 'entity-num',
        type: 'text',
        gridPosition: { x: 8, y: 0, w: 4, h: 2 },
        properties: {
          content: 'number',
          fontSize: '18px',
          fontWeight: '500',
          color: '#000000',
          align: 'right',
        },
      },
      {
        id: 'divider-1',
        type: 'divider',
        gridPosition: { x: 0, y: 3, w: 12, h: 1 },
        properties: {
          thickness: '2px',
          color: '#000000',
          style: 'solid',
        },
      },
      {
        id: 'client-section',
        type: 'client-info',
        gridPosition: { x: 0, y: 5, w: 6, h: 4 },
        properties: {
          content: '$client.name\n$client.address\n$client.city_state_postal',
          fontSize: '12px',
          lineHeight: '1.3',
          align: 'left',
          color: '#000000',
          showTitle: false,
        },
      },
      {
        id: 'total-section',
        type: 'total',
        gridPosition: { x: 7, y: 21, w: 5, h: 4 },
        properties: {
          items: [
            { label: '$subtotal_label', field: '$subtotal' },
            {
              label: '$total_label',
              field: '$total',
              isTotal: true,
            },
          ],
          fontSize: '13px',
          align: 'right',
          labelColor: '#000000',
          amountColor: '#000000',
          totalFontSize: '18px',
          totalFontWeight: 'bold',
          totalColor: '#000000',
          spacing: '8px',
        },
      },
      {
        id: 'items-table',
        type: 'table',
        gridPosition: { x: 0, y: 10, w: 12, h: 10 },
        properties: {
          columns: [
            {
              id: 'product_key',
              header: 'Item',
              field: 'item.product_key',
              width: '50%',
              align: 'left',
            },
            {
              id: 'quantity',
              header: 'Quantity',
              field: 'item.quantity',
              width: '15%',
              align: 'center',
            },
            {
              id: 'cost',
              header: 'Price',
              field: 'item.cost',
              width: '17%',
              align: 'right',
            },
            {
              id: 'line_total',
              header: 'Line Total',
              field: 'item.line_total',
              width: '18%',
              align: 'right',
            },
          ],
          headerBg: '#FFFFFF',
          headerColor: '#000000',
          headerFontWeight: 'bold',
          rowBg: '#FFFFFF',
          alternateRowBg: '#FFFFFF',
          headerBorders: {
            ...DEFAULT_TABLE_REGION_BORDER_PROPS,
            sides: { ...DEFAULT_TABLE_REGION_BORDER_PROPS.sides },
          },
          rowBorders: {
            ...DEFAULT_TABLE_REGION_BORDER_PROPS,
            sides: { ...DEFAULT_TABLE_REGION_BORDER_PROPS.sides },
          },
          fontSize: '12px',
          padding: '10px',
          showBorders: false,
          alternateRows: false,
        },
      },
      {
        id: 'divider-2',
        type: 'divider',
        gridPosition: { x: 0, y: 20, w: 12, h: 1 },
        properties: {
          thickness: '1px',
          color: '#E5E7EB',
          style: 'solid',
        },
      },
      {
        id: 'total-section-2',
        type: 'total',
        gridPosition: { x: 7, y: 21, w: 5, h: 4 },
        properties: {
          items: [
            { label: '$subtotal_label', field: '$subtotal' },
            {
              label: '$total_label',
              field: '$total',
              isTotal: true,
            },
          ],
          fontSize: '13px',
          align: 'right',
          labelColor: '#000000',
          amountColor: '#000000',
          totalFontSize: '18px',
          totalFontWeight: 'bold',
          totalColor: '#000000',
          spacing: '8px',
        },
      },
    ],
  },

  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with an empty template',
    category: 'blank',
    tags: ['Custom'],
    layout: {
      cols: 12,
      rowHeight: 20,
      margin: [10, 10],
      containerPadding: [20, 20],
    },
    blocks: [],
  },
];

export function getTemplateById(id: string): InvoiceTemplate | undefined {
  return templates.find((template) => template.id === id);
}

export function getTemplatesByCategory(category: string): InvoiceTemplate[] {
  if (category === 'all') {
    return templates;
  }
  return templates.filter((template) => template.category === category);
}
