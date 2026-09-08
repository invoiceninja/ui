/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical } from 'lucide-react';
import { Block } from '../types';
import { BlockRenderer } from './BlockRenderer';
import { useBlockLabel } from '../block-library';
import { useColorScheme } from '$app/common/colors';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import {
  BlockRegion,
  clampChromeHeight,
  DEFAULT_FOOTER_HEIGHT,
  DEFAULT_HEADER_HEIGHT,
  EXISTING_BLOCK_DRAG_TYPE,
} from '../utils/page-regions';
import { GRID_CONFIG } from '../utils/grid-converter';
import { getInvoiceWidgetClassName } from '../constants/widget-classes';

interface PageChromeZoneProps {
  region: Extract<BlockRegion, 'header' | 'footer'>;
  height: number;
  blocks: Block[];
  selectedBlockId: string | null;
  isDragOver: boolean;
  onHeightChange: (height: number) => void;
  onSelectBlock: (blockId: string | null) => void;
  onDeleteBlock: (blockId: string) => void;
  onBlockDragStart: (blockId: string) => void;
  onBlockDragEnd: () => void;
  backgroundColor?: string;
}

export function PageChromeZone({
  region,
  height,
  blocks,
  selectedBlockId,
  isDragOver,
  onHeightChange,
  onSelectBlock,
  onDeleteBlock,
  onBlockDragStart,
  onBlockDragEnd,
  backgroundColor,
}: PageChromeZoneProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const fallbackHeight =
    region === 'header' ? DEFAULT_HEADER_HEIGHT : DEFAULT_FOOTER_HEIGHT;

  return (
    <div
      data-page-region={region}
      className="invoice-page-chrome-zone relative flex flex-col"
      style={{
        minHeight: height,
        borderBottom:
          region === 'header' ? `1px dashed ${colors.$24}` : undefined,
        borderTop: region === 'footer' ? `1px dashed ${colors.$24}` : undefined,
        backgroundColor: backgroundColor
          ? backgroundColor
          : isDragOver
            ? `${accentColor}14`
            : colors.$23,
        boxShadow: isDragOver && backgroundColor
          ? `inset 0 0 0 2px ${accentColor}`
          : undefined,
      }}
    >
      <div
        className="flex items-center justify-between px-2 py-1"
        style={{ color: colors.$17 }}
      >
        <span className="text-[10px] font-medium uppercase tracking-wide pointer-events-none">
          {t('repeats_every_page') || 'Repeats on every page'}
        </span>
        <label className="flex items-center gap-1 text-[10px]">
          <span>{t('height') || 'Height'}</span>
          <input
            type="number"
            min={24}
            max={400}
            value={height}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              onHeightChange(
                clampChromeHeight(event.target.value, fallbackHeight)
              )
            }
            className="w-16 rounded border px-1 py-0.5 text-[10px]"
            style={{
              borderColor: colors.$5,
              background: colors.$1,
              color: colors.$3,
            }}
          />
        </label>
      </div>

      <div
        className="relative flex-1"
        style={{
          minHeight: Math.max(40, height - 28),
          padding: `4px ${GRID_CONFIG.containerPadding[0]}px 8px`,
        }}
      >
        {blocks.length === 0 && (
          <div
            className="flex h-full items-center justify-center text-xs pointer-events-none"
            style={{ color: colors.$17 }}
          >
            {t('drop_components_here') || 'Drop components here'}
          </div>
        )}

        {blocks.length > 0 && (
          <div
            className="grid items-start"
            style={{
              gridTemplateColumns: `repeat(${GRID_CONFIG.cols}, minmax(0, 1fr))`,
              columnGap: `${GRID_CONFIG.margin[0]}px`,
              rowGap: `${GRID_CONFIG.margin[1]}px`,
            }}
          >
            {blocks.map((block) => (
              <ChromeZoneBlock
                key={block.id}
                block={block}
                selected={selectedBlockId === block.id}
                onSelect={() => onSelectBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
                onDragStart={onBlockDragStart}
                onDragEnd={onBlockDragEnd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChromeZoneBlock({
  block,
  selected,
  onSelect,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (blockId: string) => void;
  onDragEnd: () => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const label = useBlockLabel(block.type);
  const { x, w } = block.gridPosition;
  const columnStart = Math.min(GRID_CONFIG.cols, Math.max(1, x + 1));
  const columnSpan = Math.min(GRID_CONFIG.cols - columnStart + 1, Math.max(1, w));

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData(EXISTING_BLOCK_DRAG_TYPE, block.id);
    event.dataTransfer.setData('text/plain', block.id);
    event.dataTransfer.effectAllowed = 'move';
    onDragStart(block.id);
  };

  return (
    <div
      className="min-w-0"
      style={{
        gridColumn: `${columnStart} / span ${columnSpan}`,
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <div
        className="block-wrapper rounded-lg"
        style={{
          backgroundColor: colors.$1,
          outline: `1px dashed ${selected ? colors.$3 : colors.$24}`,
        }}
      >
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
          className="h-6 rounded-t px-2 flex items-center justify-between text-[10px] cursor-move"
          style={{ backgroundColor: accentColor, color: '#ffffff' }}
        >
          <span className="flex items-center gap-1 truncate font-medium">
            <GripVertical className="h-3 w-3 shrink-0 text-white/70" />
            {label}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="px-1 text-white/80 hover:text-white"
            title={String(t('delete'))}
          >
            ×
          </button>
        </div>
        <div
          className={`block-content-measure ${getInvoiceWidgetClassName(
            block.type,
            block.properties.cssClasses
          )}`}
          data-widget-type={block.type}
        >
          <BlockRenderer block={block} />
        </div>
      </div>
    </div>
  );
}
