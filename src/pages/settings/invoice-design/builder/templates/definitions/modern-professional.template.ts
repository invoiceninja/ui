/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { TemplateFactory } from '../registry';
import {
  DEFAULT_LABEL_TEXT_COLOR,
  DEFAULT_VALUE_TEXT_COLOR,
} from '../../constants/design-colors';
import { DEFAULT_TABLE_REGION_BORDER_PROPS } from '../../utils/table-cell-borders';

export default ((t) => ({
  order: 10,
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
      gridPosition: { x: 0, y: 0, w: 6, h: 3 },
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
      gridPosition: { x: 8, y: 0, w: 6, h: 3 },
      properties: {
        content:
          '$company.name\n$company.address1\n$company.city_state_postal\n$company.phone',
        lineHeight: '1.3',
        align: 'right',
        color: '#6B7280',
      },
    },
    {
      id: 'divider-1',
      type: 'divider',
      gridPosition: { x: 0, y: 1, w: 12, h: 1 },
      properties: {
        thickness: '1px',
        color: '#298AAB',
        style: 'solid',
        marginTop: '10px',
        marginBottom: '10px',
      },
    },
    // Invoice title
    {
      id: 'invoice-title',
      type: 'text',
      gridPosition: { x: 0, y: 2, w: 6, h: 2 },
      properties: {
        content: '$entity_label',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#111827',
        align: 'left',
      },
    },
    {
      id: 'divider-2',
      type: 'divider',
      gridPosition: { x: 0, y: 3, w: 12, h: 1 },
      properties: {
        thickness: '1px',
        color: '#298AAB',
        style: 'solid',
        marginTop: '10px',
        marginBottom: '10px',
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
        content: '$client.name\n$client.address1\n$client.city_state_postal\n$client.country',
        lineHeight: '1.3',
        align: 'left',
        color: DEFAULT_VALUE_TEXT_COLOR,
        showTitle: true,
        title: '$bill_to_label',
        titleFontWeight: 'bold',
      },
    },

    // {
    //   id: 'client-shipping-info',
    //   gridPosition: { x: 6, y: 7, w: 6, h: 4 },
    //   type: 'client-shipping-info',
    //   properties: {
    //     content:
    //       '$client.shipping_address1\n$client.shipping_address2\n$client.city_state_postal\n$client.shipping_country',
    //     lineHeight: '1.3',
    //     align: 'left',
    //     color: DEFAULT_VALUE_TEXT_COLOR,
    //     showTitle: true,
    //     title: '$ship_to_label',
    //     titleFontWeight: 'bold',
    //   },
    // },

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
      gridPosition: { x: 0, y: 12, w: 12, h: 6 },
      properties: {
        columns: [
          {
            id: 'notes',
            header: '$product.description_label',
            field: 'item.notes',
            width: '45%',
            align: 'left',
          },
          {
            id: 'quantity',
            header: '$product.quantity_label',
            field: 'item.quantity',
            width: '15%',
            align: 'center',
          },
          {
            id: 'cost',
            header: '$product.unit_cost_label',
            field: 'item.cost',
            width: '20%',
            align: 'right',
          },
          {
            id: 'line_total',
            header: '$product.line_total_label',
            field: 'item.line_total',
            width: '20%',
            align: 'right',
          },
        ],
        headerBg: '#F3F4F6',
        headerColor: '#298AAB',
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
        padding: '12px',
        alternateRows: true,
        rowColor: DEFAULT_VALUE_TEXT_COLOR,
      },
      locked: false,
    },

    {
      id: 'tasks-table',
      type: 'tasks-table',
      gridPosition: { x: 0, y: 13, w: 12, h: 5 },
      properties: {
        columns: [
          {
            id: 'service',
            header: '$task.service_label',
            field: 'item.product_key',
            width: '25%',
            align: 'left',
          },
          {
            id: 'notes',
            header: '$task.description_label',
            field: 'item.notes',
            width: '30%',
            align: 'left',
          },
          {
            id: 'hours',
            header: '$task.hours_label',
            field: 'item.quantity',
            width: '10%',
            align: 'center',
          },
          {
            id: 'rate',
            header: '$task.rate_label',
            field: 'item.cost',
            width: '15%',
            align: 'right',
          },
          {
            id: 'line_total',
            header: '$task.line_total_label',
            field: 'item.line_total',
            width: '15%',
            align: 'right',
          },
        ],
        headerBg: '#F3F4F6',
        headerColor: '#298AAB',
        headerFontWeight: 'bold',
        rowBg: '#FFFFFF',
        rowColor: DEFAULT_VALUE_TEXT_COLOR,
        alternateRowBg: '#F9FAFB',
        headerBorders: {
          ...DEFAULT_TABLE_REGION_BORDER_PROPS,
          sides: { ...DEFAULT_TABLE_REGION_BORDER_PROPS.sides },
        },
        rowBorders: {
          ...DEFAULT_TABLE_REGION_BORDER_PROPS,
          sides: { ...DEFAULT_TABLE_REGION_BORDER_PROPS.sides },
        },
        padding: '8px',
        alternateRows: true,
      },
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
            labelStyle: { fontWeight: 'bold' },
            valueStyle: { fontWeight: 'bold' },
          },
          { label: '$paid_to_date_label', field: '$paid_to_date' },
          {
            label: '$balance_due_label',
            field: '$balance_due',
            isBalance: true,
          },
        ],
        align: 'right',
        spacing: '2px',
      },
    },

    // Footer
    {
      id: 'footer-text',
      type: 'footer',
      gridPosition: { x: 0, y: 28, w: 12, h: 2 },
      properties: {
        content: "$footer",
        fontWeight: "normal",
        lineHeight: "1.3",
        color: "#6B7280",
        align: "center",
        fontStyle: "normal",
        padding: "0px"
      },
    },
  ],
})) satisfies TemplateFactory;
