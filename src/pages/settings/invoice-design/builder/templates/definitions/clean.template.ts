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
import { GRID_CONFIG } from '../../utils/grid-converter';

export default ((t) => ({
  order: 15,
  id: 'clean',
  name: 'Clean',
  description: 'Simple and clean layout',
  category: 'modern',
  tags: ['Clean', 'Professional'],
  layout: {
    cols: GRID_CONFIG.cols,
    rowHeight: GRID_CONFIG.rowHeight,
    margin: GRID_CONFIG.margin,
    containerPadding: GRID_CONFIG.containerPadding,
  },
  blocks: [
    {
      id: 'logo',
      type: 'logo',
      gridPosition: { x: 0, y: 0, w: 4, h: 6 },
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
      gridPosition: { x: 8, y: 0, w: 4, h: 8 },
      properties: {
        content:
          '$company.name\n$company.address1\n$company.city_state_postal\n$company.phone',
        lineHeight: '1.3',
        align: 'right',
        color: '#6B7280',
      },
    },
    {
      id: 'invoice-title',
      type: 'text',
      gridPosition: { x: 0, y: 11, w: 6, h: 4 },
      properties: {
        content: '$entity_label',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#111827',
        align: 'left',
      },
    },
    {
      id: 'divider-1',
      type: 'divider',
      gridPosition: { x: 0, y: 15, w: 12, h: 3 },
      properties: {
        thickness: '1px',
        color: '#298AAB',
        style: 'solid',
        marginTop: '10px',
        marginBottom: '10px',
      },
    },
    {
      id: 'entity-details',
      type: 'invoice-details',
      gridPosition: { x: 8, y: 18, w: 4, h: 6 },
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
        labelColor: '#6B7280',
        color: '#000000',
        showLabels: true,
      },
    },
    {
      id: 'client-info',
      type: 'client-info',
      gridPosition: { x: 0, y: 18, w: 6, h: 8 },
      properties: {
        content: '$client.name\n$client.address1\n$client.city_state_postal',
        lineHeight: '1.3',
        align: 'left',
        color: '#000000',
        showTitle: true,
        title: '$bill_to_label',
        titleFontWeight: 'bold',
      },
    },
    {
      id: 'spacer-1',
      type: 'spacer',
      gridPosition: { x: 0, y: 26, w: 12, h: 2 },
      properties: {
        height: '20px',
      },
    },
    {
      id: 'line-items',
      type: 'table',
      gridPosition: { x: 0, y: 28, w: 12, h: 12 },
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
          color: '#E5E7EB',
          width: 1,
          sides: { top: true, right: true, bottom: true, left: true },
        },
        rowBorders: {
          color: '#E5E7EB',
          width: 1,
          sides: { top: true, right: true, bottom: true, left: true },
        },
        padding: '12px',
        alternateRows: true,
        rowColor: '#000000',
      },
    },
    {
      id: 'tasks-table',
      type: 'tasks-table',
      gridPosition: { x: 0, y: 40, w: 12, h: 14 },
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
        rowColor: '#000000',
        alternateRowBg: '#F9FAFB',
        headerBorders: {
          color: '#E5E7EB',
          width: 1,
          sides: { top: true, right: true, bottom: true, left: true },
        },
        rowBorders: {
          color: '#E5E7EB',
          width: 1,
          sides: { top: true, right: true, bottom: true, left: true },
        },
        padding: '8px',
        alternateRows: true,
      },
    },
    {
      id: "terms",
      type: "terms",
      gridPosition: {
        x: 0,
        y: 54,
        w: 7,
        h: 2
      },
      properties: {
        content: "$terms",
        fontWeight: "normal",
        lineHeight: "1.3",
        align: "left",
        fontStyle: "normal",
        padding: "0px",
        color: "#000000"
      }
    },
    {
      id: "public-notes",
      type: "public-notes",
      gridPosition: {
        x: 0,
        y: 50,
        w: 7,
        h: 4
      },
      properties: {
        content: "$public_notes",
        fontWeight: "normal",
        lineHeight: "1.3",
        align: "left",
        fontStyle: "normal",
        padding: "0px",
        color: "#000000"
      }
    },
    {
      id: 'totals',
      type: 'total',
      gridPosition: { x: 7, y: 54, w: 5, h: 13 },
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
        spacing: '10px',
      },
    },
    {
      id: 'footer-text',
      type: 'footer',
      gridPosition: { x: 0, y: 67, w: 12, h: 2 },
      properties: {
        content: '$footer',
        fontWeight: 'normal',
        lineHeight: '1.3',
        color: '#6B7280',
        align: 'center',
        fontStyle: 'normal',
        padding: '0px',
      },
    },
  ],
})) satisfies TemplateFactory;
