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
  Building2,
  Type,
  Image,
  Table,
  Minus,
  DollarSign,
  QrCode,
  PenTool,
  User,
  Receipt,
  Space,
} from 'lucide-react';
import { BlockDefinition } from './types';

export const blockLibrary: BlockDefinition[] = [
  // Branding
  {
    type: 'logo',
    label: 'Company Logo',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Your company logo',
    defaultSize: { w: 4, h: 4 },
    defaultProperties: {
      source: '$company.logo',
      align: 'left',
      maxWidth: '150px',
      objectFit: 'contain',
    },
    category: 'branding',
  },
  {
    type: 'company-info',
    label: 'Company Info',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Company name, address, contact',
    defaultSize: { w: 6, h: 4 },
    defaultProperties: {
      content: '$company.name\n$company.address\n$company.city_state_postal\n$company.phone\n$company.email',
      fontSize: '12px',
      lineHeight: '1.6',
      align: 'left',
      color: '#374151',
    },
    category: 'branding',
  },

  // Content
  {
    type: 'text',
    label: 'Text Block',
    icon: <Type className="w-5 h-5" />,
    description: 'Custom text or headings',
    defaultSize: { w: 8, h: 3 },
    defaultProperties: {
      content: 'Enter your text...',
      fontSize: '16px',
      fontWeight: 'normal',
      lineHeight: '1.5',
      color: '#000000',
      align: 'left',
    },
    category: 'content',
  },
  {
    type: 'invoice-details',
    label: 'Invoice Details',
    icon: <Receipt className="w-5 h-5" />,
    description: 'Invoice number, date, due date',
    defaultSize: { w: 6, h: 4 },
    defaultProperties: {
      content: 'Invoice #: $invoice.number\nDate: $invoice.date\nDue Date: $invoice.due_date\nPO Number: $invoice.po_number',
      fontSize: '12px',
      lineHeight: '1.8',
      align: 'left',
      color: '#374151',
      labelColor: '#6B7280',
      showLabels: true,
    },
    category: 'content',
  },
  {
    type: 'client-info',
    label: 'Client Info',
    icon: <User className="w-5 h-5" />,
    description: 'Client name and address',
    defaultSize: { w: 6, h: 4 },
    defaultProperties: {
      content: '$client.name\n$client.address\n$client.city_state_postal\n$client.phone\n$client.email',
      fontSize: '12px',
      lineHeight: '1.6',
      align: 'left',
      color: '#374151',
      showTitle: true,
      title: 'Bill To:',
      titleFontWeight: 'bold',
    },
    category: 'content',
  },
  {
    type: 'image',
    label: 'Image',
    icon: <Image className="w-5 h-5" />,
    description: 'Upload custom image',
    defaultSize: { w: 3, h: 3 },
    defaultProperties: {
      source: '',
      align: 'center',
      maxWidth: '200px',
      objectFit: 'contain',
    },
    category: 'content',
  },

  // Data
  {
    type: 'table',
    label: 'Line Items Table',
    icon: <Table className="w-5 h-5" />,
    description: 'Invoice items with columns',
    defaultSize: { w: 12, h: 8 },
    defaultProperties: {
      columns: [
        {
          id: 'item',
          header: 'Item',
          field: 'item.product_key',
          width: '30%',
          align: 'left',
        },
        {
          id: 'description',
          header: 'Description',
          field: 'item.notes',
          width: '30%',
          align: 'left',
        },
        {
          id: 'quantity',
          header: 'Qty',
          field: 'item.quantity',
          width: '10%',
          align: 'center',
        },
        {
          id: 'rate',
          header: 'Rate',
          field: 'item.cost',
          width: '15%',
          align: 'right',
        },
        {
          id: 'amount',
          header: 'Amount',
          field: 'item.line_total',
          width: '15%',
          align: 'right',
        },
      ],
      headerBg: '#F3F4F6',
      headerColor: '#111827',
      headerFontWeight: 'bold',
      rowBg: '#FFFFFF',
      alternateRowBg: '#F9FAFB',
      borderColor: '#E5E7EB',
      fontSize: '12px',
      padding: '8px',
      showBorders: true,
      alternateRows: true,
    },
    category: 'data',
    essential: true,
  },
  {
    type: 'total',
    label: 'Invoice Totals',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Subtotal, tax, and total',
    defaultSize: { w: 6, h: 6 },
    defaultProperties: {
      items: [
        { label: 'Subtotal', field: '$invoice.subtotal', show: true },
        { label: 'Discount', field: '$invoice.discount', show: true },
        { label: 'Tax', field: '$invoice.tax', show: true },
        { label: 'Total', field: '$invoice.total', show: true, isTotal: true },
        { label: 'Amount Paid', field: '$invoice.paid_to_date', show: true },
        { label: 'Balance Due', field: '$invoice.balance', show: true, isBalance: true },
      ],
      fontSize: '13px',
      align: 'right',
      labelColor: '#6B7280',
      amountColor: '#111827',
      totalFontSize: '18px',
      totalFontWeight: 'bold',
      totalColor: '#111827',
      balanceColor: '#DC2626',
      spacing: '8px',
      showLabels: true,
    },
    category: 'data',
    essential: true,
  },

  // Layout
  {
    type: 'divider',
    label: 'Divider Line',
    icon: <Minus className="w-5 h-5" />,
    description: 'Horizontal separator',
    defaultSize: { w: 12, h: 1 },
    defaultProperties: {
      thickness: '1px',
      color: '#E5E7EB',
      style: 'solid',
      marginTop: '10px',
      marginBottom: '10px',
    },
    category: 'layout',
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: <Space className="w-5 h-5" />,
    description: 'Empty space for layout',
    defaultSize: { w: 12, h: 2 },
    defaultProperties: {
      height: '40px',
    },
    category: 'layout',
  },
  {
    type: 'qrcode',
    label: 'QR Code',
    icon: <QrCode className="w-5 h-5" />,
    description: 'QR code for payment/link',
    defaultSize: { w: 2, h: 2 },
    defaultProperties: {
      data: '$invoice.public_url',
      size: '100px',
      align: 'center',
    },
    category: 'layout',
  },
  {
    type: 'signature',
    label: 'Signature Line',
    icon: <PenTool className="w-5 h-5" />,
    description: 'Signature area',
    defaultSize: { w: 4, h: 3 },
    defaultProperties: {
      label: 'Authorized Signature',
      showLine: true,
      showDate: true,
      align: 'left',
      fontSize: '12px',
      color: '#6B7280',
    },
    category: 'layout',
  },
];

// Helper function to get block definition by type
export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return blockLibrary.find((def) => def.type === type);
}

// Helper to get block label
export function getBlockLabel(type: string): string {
  return getBlockDefinition(type)?.label || type;
}

// Helper to get block description
export function getBlockDescription(type: string): string {
  return getBlockDefinition(type)?.description || '';
}
