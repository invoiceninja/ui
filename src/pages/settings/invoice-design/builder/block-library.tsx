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
import {
  Building2,
  Image,
  Table,
  Minus,
  DollarSign,
  QrCode,
  PenTool,
  User,
  Receipt,
  Space,
  Type,
  Clock,
  StickyNote,
  PanelBottom,
  FileText,
  MapPin,
} from 'lucide-react';
import { BlockDefinition } from './types';

// Hook to get translated block library
export function useBlockLibrary(): BlockDefinition[] {
  const [t] = useTranslation();

  return [
    // Branding
    {
      type: 'logo',
      label: t('company_logo'),
      icon: <Building2 className="w-5 h-5" />,
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
      label: t('company_details'),
      icon: <Building2 className="w-5 h-5" />,
      defaultSize: { w: 6, h: 4 },
      defaultProperties: {
        fieldConfigs: [
          {
            id: 'name',
            label: t('company_name'),
            variable: '$company.name',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
          {
            id: 'address1',
            label: t('address1'),
            variable: '$company.address1',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
          {
            id: 'city_state_postal',
            label: t('city_state_postal'),
            variable: '$company.city_state_postal',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
          {
            id: 'phone',
            label: t('phone'),
            variable: '$company.phone',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
          {
            id: 'email',
            label: t('email'),
            variable: '$company.email',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
        ],
        lineHeight: '1.3',
        align: 'left',
        showTitle: false,
        title: t('company_details'),
        titleFontWeight: 'bold',
      },
      category: 'branding',
    },

    {
      type: 'text',
      label: t('text'),
      icon: <Type className="size-5" />,
      defaultSize: { w: 6, h: 2 },
      defaultProperties: {
        content: t('enter_text'),
        fontWeight: 'normal',
        lineHeight: '1.3',
        align: 'left',
        fontStyle: 'normal',
        padding: '0px',
      },
      category: 'content',
    },
    {
      type: 'client-info',
      label: t('client_details'),
      icon: <User className="w-5 h-5" />,
      defaultSize: { w: 6, h: 4 },
      defaultProperties: {
        fieldConfigs: [
          {
            id: 'name',
            label: t('client_name'),
            variable: '$client.name',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
          {
            id: 'address1',
            label: t('address1'),
            variable: '$client.address1',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
          {
            id: 'city_state_postal',
            label: t('city_state_postal'),
            variable: '$client.city_state_postal',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
          {
            id: 'phone',
            label: t('phone'),
            variable: '$client.phone',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
          {
            id: 'email',
            label: t('email'),
            variable: '$client.email',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
        ],
        content:
          '$client.name\n$client.address1\n$client.city_state_postal\n$client.phone\n$client.email',
        lineHeight: '1.3',
        align: 'left',
        showTitle: false,
        title: t('bill_to'),
        titleFontWeight: 'bold',
      },
      category: 'content',
    },
    {
      type: 'client-shipping-info',
      label: t('ship_to'),
      icon: <MapPin className="w-5 h-5" />,
      defaultSize: { w: 6, h: 4 },
      defaultProperties: {
        fieldConfigs: [
          {
            id: 'shipping_address1',
            label: t('address1'),
            variable: '$client.shipping_address1',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
          {
            id: 'shipping_city_state_postal',
            label: t('city_state_postal'),
            variable: '$client.shipping_city_state_postal',
            prefix: '',
            suffix: '',
            hideIfEmpty: true,
          },
        ],
        content:
          '$client.shipping_address1\n$client.shipping_city_state_postal',
        lineHeight: '1.3',
        align: 'left',
        showTitle: false,
        title: t('ship_to'),
        titleFontWeight: 'bold',
      },
      category: 'content',
    },
    {
      type: 'invoice-details',
      label: t('invoice_details'),
      icon: <Receipt className="w-5 h-5" />,
      defaultSize: { w: 6, h: 5 },
      defaultProperties: {
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
          {
            id: 'balance',
            label: '$balance_label',
            variable: '$balance',
            prefix: '$balance_label: ',
            hideIfEmpty: true,
          },
        ],
        lineHeight: '1.3',
        align: 'right',
        labelColor: '#6B7280',
        showLabels: true,
        labelAlign: 'right',
        valueAlign: 'right',
        labelPadding: '0px',
        valuePadding: '0px',
        labelValueGap: '12px',
        rowSpacing: '0px',
        valueMinWidth: '',
      },
      category: 'content',
    },
    {
      type: 'public-notes',
      label: t('public_notes'),
      icon: <StickyNote className="w-5 h-5" />,
      defaultSize: { w: 12, h: 3 },
      defaultProperties: {
        content: '$public_notes',
        fontWeight: 'normal',
        lineHeight: '1.3',
        align: 'left',
        fontStyle: 'normal',
        padding: '0px',
      },
      category: 'content',
    },
    {
      type: 'footer',
      label: t('footer'),
      icon: <PanelBottom className="w-5 h-5" />,
      defaultSize: { w: 12, h: 2 },
      defaultProperties: {
        content: '$footer',
        fontWeight: 'normal',
        lineHeight: '1.3',
        color: '#6B7280',
        align: 'center',
        fontStyle: 'normal',
        padding: '0px',
      },
      category: 'content',
    },
    {
      type: 'terms',
      label: t('terms'),
      icon: <FileText className="w-5 h-5" />,
      defaultSize: { w: 12, h: 3 },
      defaultProperties: {
        content: '$terms',
        fontWeight: 'normal',
        lineHeight: '1.3',
        align: 'left',
        fontStyle: 'normal',
        padding: '0px',
      },
      category: 'content',
    },
    {
      type: 'image',
      label: t('image'),
      icon: <Image className="w-5 h-5" />,
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
      label: t('products'),
      icon: <Table className="w-5 h-5" />,
      defaultSize: { w: 12, h: 8 },
      defaultProperties: {
        columns: [
          {
            id: 'product_key',
            header: t('item'),
            field: 'item.product_key',
            width: '25%',
            align: 'left',
          },
          {
            id: 'notes',
            header: t('description'),
            field: 'item.notes',
            width: '30%',
            align: 'left',
          },
          {
            id: 'quantity',
            header: t('qty'),
            field: 'item.quantity',
            width: '10%',
            align: 'center',
          },
          {
            id: 'cost',
            header: t('rate'),
            field: 'item.cost',
            width: '15%',
            align: 'right',
          },
          {
            id: 'line_total',
            header: t('line_total'),
            field: 'item.line_total',
            width: '15%',
            align: 'right',
          },
        ],
        headerBg: '#F3F4F6',
        headerColor: '#111827',
        headerFontWeight: 'bold',
        rowBg: '#FFFFFF',
        rowColor: '#374151',
        alternateRowBg: '#F9FAFB',
        borderColor: '#E5E7EB',
        padding: '8px',
        showBorders: true,
        alternateRows: true,
      },
      category: 'data',
      essential: true,
    },
    {
      type: 'tasks-table',
      label: t('tasks'),
      icon: <Clock className="w-5 h-5" />,
      defaultSize: { w: 12, h: 8 },
      defaultProperties: {
        columns: [
          {
            id: 'service',
            header: t('service'),
            field: 'item.product_key',
            width: '25%',
            align: 'left',
          },
          {
            id: 'notes',
            header: t('description'),
            field: 'item.notes',
            width: '30%',
            align: 'left',
          },
          {
            id: 'hours',
            header: t('hours'),
            field: 'item.quantity',
            width: '10%',
            align: 'center',
          },
          {
            id: 'rate',
            header: t('rate'),
            field: 'item.cost',
            width: '15%',
            align: 'right',
          },
          {
            id: 'line_total',
            header: t('line_total'),
            field: 'item.line_total',
            width: '15%',
            align: 'right',
          },
        ],
        headerBg: '#F3F4F6',
        headerColor: '#111827',
        headerFontWeight: 'bold',
        rowBg: '#FFFFFF',
        rowColor: '#374151',
        alternateRowBg: '#F9FAFB',
        borderColor: '#E5E7EB',
        padding: '8px',
        showBorders: true,
        alternateRows: true,
      },
      category: 'data',
      essential: true,
    },
    {
      type: 'total',
      label: t('invoice_total'),
      icon: <DollarSign className="w-5 h-5" />,
      defaultSize: { w: 6, h: 6 },
      defaultProperties: {
        items: [
          { label: '$subtotal_label', field: '$subtotal' },
          { label: '$discount_label', field: '$discount' },
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
        align: 'right',
        labelAlign: 'right',
        valueAlign: 'right',
        labelColor: '#6B7280',
        amountColor: '#111827',
        totalFontWeight: 'bold',
        totalColor: '#111827',
        balanceColor: '#DC2626',
        spacing: '0px',
        labelPadding: '0px',
        valuePadding: '0px',
        labelValueGap: '10px',
        valueMinWidth: '',
        showLabels: true,
      },
      category: 'data',
      essential: true,
    },

    // Layout
    {
      type: 'divider',
      label: t('divider_line'),
      icon: <Minus className="w-5 h-5" />,
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
      label: t('spacer'),
      icon: <Space className="w-5 h-5" />,
      defaultSize: { w: 12, h: 2 },
      defaultProperties: {
        height: '40px',
      },
      category: 'layout',
    },
    {
      type: 'qrcode',
      label: t('qr_code'),
      icon: <QrCode className="w-5 h-5" />,
      defaultSize: { w: 2, h: 2 },
      defaultProperties: {
        qrType: 'payment_link',
        data: '$payment_qrcode',
        size: '100px',
        align: 'center',
      },
      category: 'layout',
    },
    {
      type: 'signature',
      label: t('signature_line'),
      icon: <PenTool className="w-5 h-5" />,
      defaultSize: { w: 4, h: 3 },
      defaultProperties: {
        label: t('authorized_signature'),
        showLine: true,
        showDate: true,
        align: 'left',
        color: '#6B7280',
      },
      category: 'layout',
    },
  ];
}

// Hook to get a single block definition by type
export function useBlockDefinition(type: string): BlockDefinition | undefined {
  const blockLibrary = useBlockLibrary();
  return blockLibrary.find((def) => def.type === type);
}

// Hook to get translated block label
export function useBlockLabel(type: string): string {
  const blockLibrary = useBlockLibrary();
  return blockLibrary.find((def) => def.type === type)?.label || type;
}

// Hook to get translated block description
export function useBlockDescription(type: string): string {
  const blockLibrary = useBlockLibrary();
  return blockLibrary.find((def) => def.type === type)?.description || '';
}
