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
          content: '$company.name\n$company.address\n$company.city_state_postal\n$company.phone',
          fontSize: '11px',
          lineHeight: '1.6',
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
          content: 'INVOICE',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#111827',
          align: 'left',
        },
      },

      // Invoice details
      {
        id: 'invoice-details',
        type: 'invoice-details',
        gridPosition: { x: 8, y: 4, w: 4, h: 3 },
        properties: {
          content: 'Invoice #: $invoice.number\nDate: $invoice.date\nDue Date: $invoice.due_date',
          fontSize: '11px',
          lineHeight: '1.8',
          align: 'right',
          color: '#374151',
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
          lineHeight: '1.6',
          align: 'left',
          color: '#374151',
          showTitle: true,
          title: 'Bill To:',
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
              header: 'Amount',
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
          borderColor: '#E5E7EB',
          fontSize: '12px',
          padding: '12px',
          showBorders: true,
          alternateRows: true,
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
            { label: 'Subtotal', field: '$invoice.subtotal', show: true },
            { label: 'Tax', field: '$invoice.tax', show: true },
            { label: 'Total', field: '$invoice.total', show: true, isTotal: true },
            { label: 'Amount Paid', field: '$invoice.paid_to_date', show: true },
            { label: 'Balance Due', field: '$invoice.balance', show: true, isBalance: true },
          ],
          fontSize: '13px',
          align: 'right',
          labelColor: '#6B7280',
          amountColor: '#111827',
          totalFontSize: '20px',
          totalFontWeight: 'bold',
          totalColor: '#111827',
          balanceColor: '#DC2626',
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
        id: 'invoice-num',
        type: 'text',
        gridPosition: { x: 8, y: 0, w: 4, h: 2 },
        properties: {
          content: 'Invoice $invoice.number',
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
          lineHeight: '1.8',
          align: 'left',
          color: '#000000',
          showTitle: false,
        },
      },
      {
        id: 'invoice-info',
        type: 'invoice-details',
        gridPosition: { x: 8, y: 5, w: 4, h: 3 },
        properties: {
          content: 'Date: $invoice.date\nDue: $invoice.due_date',
          fontSize: '12px',
          lineHeight: '1.8',
          align: 'right',
          color: '#000000',
        },
      },
      {
        id: 'spacer-main',
        type: 'spacer',
        gridPosition: { x: 0, y: 9, w: 12, h: 1 },
        properties: {
          height: '30px',
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
              header: 'Total',
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
          borderColor: '#E5E7EB',
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
        id: 'total-section',
        type: 'total',
        gridPosition: { x: 7, y: 21, w: 5, h: 4 },
        properties: {
          items: [
            { label: 'Subtotal', field: '$invoice.subtotal', show: true },
            { label: 'Total', field: '$invoice.total', show: true, isTotal: true },
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
