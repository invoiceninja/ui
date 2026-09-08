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
import { DEFAULT_TABLE_REGION_BORDER_PROPS } from '../../utils/table-cell-borders';

export default ((t) => ({
  order: 20,
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
        content: '$number',
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
            labelStyle: { fontWeight: 'bold' },
            valueStyle: { fontWeight: 'bold' },
          },
        ],
        align: 'right',
        spacing: '2px',
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
            header: '$product.product_key_label',
            field: 'item.product_key',
            width: '50%',
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
            width: '17%',
            align: 'right',
          },
          {
            id: 'line_total',
            header: '$product.line_total_label',
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
        padding: '10px',
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
  ],
})) satisfies TemplateFactory;
