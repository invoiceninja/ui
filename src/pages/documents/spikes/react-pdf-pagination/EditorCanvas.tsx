import { useEffect, useRef, useState } from 'react';
import { BlockPlacement, PaginationFeedback } from './layout-feedback';
import { A4_CONTENT, A4_PAGE } from './page-geometry';

export interface CanvasBlock {
  id: string;
  text: string;
  keepTogether: boolean;
  fontSize: number;
}

function EditableContent({
  block,
  onChange,
  onHeightChange,
}: {
  block: CanvasBlock;
  onChange: (text: string) => void;
  onHeightChange: (height: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (
      element &&
      document.activeElement !== element &&
      element.innerText !== block.text
    ) {
      element.textContent = block.text;
    }

    if (element) {
      onHeightChange(element.scrollHeight + 24);
    }
  }, [block.fontSize, block.text, onHeightChange]);

  return (
    <div
      className="min-h-[20px] whitespace-pre-wrap px-2 pb-2 text-[12px] leading-[1.35] text-slate-800 outline-none"
      contentEditable
      onInput={(event) => {
        onChange(event.currentTarget.innerText);
        onHeightChange(event.currentTarget.scrollHeight + 24);
      }}
      ref={ref}
      role="textbox"
      spellCheck
      style={{ fontSize: block.fontSize }}
      suppressContentEditableWarning
      tabIndex={0}
    />
  );
}

function CanvasBlockElement({
  block,
  placement,
  selected,
  onChange,
  onDelete,
  onFontSizeChange,
  onHeightChange,
  onSelect,
  onToggleKeepTogether,
}: {
  block: CanvasBlock;
  placement: BlockPlacement;
  selected: boolean;
  onChange: (text: string) => void;
  onDelete: () => void;
  onFontSizeChange: (fontSize: number) => void;
  onHeightChange: (height: number) => void;
  onSelect: () => void;
  onToggleKeepTogether: () => void;
}) {
  const style = {
    left: A4_CONTENT.left,
    top: placement.top,
    width: A4_CONTENT.width,
    height: Math.max(placement.height, 34),
  };

  return (
    <div
      className={`group absolute overflow-visible rounded border bg-white transition-shadow ${
        selected
          ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.18)]'
          : 'border-slate-300 hover:border-blue-300'
      }`}
      onClick={onSelect}
      style={style}
    >
      <div className="flex h-6 items-center justify-between border-b border-slate-200 bg-slate-50 px-2 text-[9px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="cursor-grab text-slate-400">⠿</span>
          {block.id}
        </span>
        <span>p{placement.pageNumber}</span>
      </div>
      <div className="h-[calc(100%-24px)]">
        <EditableContent
          block={block}
          onChange={onChange}
          onHeightChange={onHeightChange}
        />
      </div>

      {selected && (
        <div className="absolute -right-1 top-7 z-10 flex translate-x-full flex-col gap-1 pl-2">
          <button
            className={`whitespace-nowrap rounded px-2 py-1 text-[10px] shadow ${
              block.keepTogether
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700'
            }`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleKeepTogether();
            }}
            type="button"
          >
            Keep together
          </button>
          <div className="flex items-center rounded bg-white text-[10px] text-slate-700 shadow">
            <button
              className="px-2 py-1"
              onClick={(event) => {
                event.stopPropagation();
                onFontSizeChange(Math.max(8, block.fontSize - 1));
              }}
              type="button"
            >
              −
            </button>
            <span className="min-w-8 text-center">{block.fontSize}pt</span>
            <button
              className="px-2 py-1"
              onClick={(event) => {
                event.stopPropagation();
                onFontSizeChange(Math.min(48, block.fontSize + 1));
              }}
              type="button"
            >
              +
            </button>
          </div>
          <button
            className="rounded bg-white px-2 py-1 text-[10px] text-red-600 shadow"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            type="button"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function EditorCanvas({
  blocks,
  feedback,
  onAddBlock,
  onDeleteBlock,
  onUpdateBlock,
}: {
  blocks: CanvasBlock[];
  feedback?: PaginationFeedback;
  onAddBlock: () => void;
  onDeleteBlock: (id: string) => void;
  onUpdateBlock: (id: string, patch: Partial<CanvasBlock>) => void;
}) {
  const [zoom, setZoom] = useState(0.8);
  const [selectedBlockId, setSelectedBlockId] = useState<string>();
  const [optimisticHeights, setOptimisticHeights] = useState<
    Record<string, number>
  >({});
  const pageCount = Math.max(feedback?.pageCount ?? 1, 1);
  const placements = feedback?.placements ?? [];
  const startPlacements = placements.filter(
    (placement) => !placement.isContinuation
  );

  const toContinuousTop = (placement: BlockPlacement) =>
    placement.top + (placement.pageNumber - 1) * A4_CONTENT.height;

  const getFlowedHeight = (blockId: string) => {
    const blockPlacements = placements.filter(
      (placement) => placement.blockId === blockId
    );
    const firstPlacement = blockPlacements[0];

    if (!firstPlacement) {
      return 0;
    }

    const top = toContinuousTop(firstPlacement);
    const bottom = Math.max(
      ...blockPlacements.map(
        (placement) => toContinuousTop(placement) + placement.height
      )
    );

    return bottom - top;
  };

  const getOptimisticDelta = (blockId: string) => {
    const measuredHeight = optimisticHeights[blockId];

    return measuredHeight === undefined
      ? 0
      : measuredHeight - getFlowedHeight(blockId);
  };

  const getOptimisticShift = (placement: BlockPlacement) => {
    const placementTop = toContinuousTop(placement);

    return startPlacements
      .filter((candidate) => toContinuousTop(candidate) < placementTop)
      .reduce(
        (shift, candidate) => shift + getOptimisticDelta(candidate.blockId),
        0
      );
  };

  const totalOptimisticDelta = startPlacements.reduce(
    (total, placement) => total + getOptimisticDelta(placement.blockId),
    0
  );
  const authoritativeCanvasHeight =
    A4_PAGE.padding * 2 + A4_CONTENT.height * pageCount;
  const continuousCanvasHeight = Math.max(
    authoritativeCanvasHeight,
    authoritativeCanvasHeight + totalOptimisticDelta
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            Document canvas
          </div>
          <div className="text-xs text-slate-500">
            {pageCount} A4 page{pageCount === 1 ? '' : 's'} · PDF coordinates
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded border bg-white px-2 py-1 text-sm"
            onClick={() => setZoom((current) => Math.max(0.55, current - 0.1))}
            type="button"
          >
            −
          </button>
          <span className="w-12 text-center text-xs text-slate-600">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="rounded border bg-white px-2 py-1 text-sm"
            onClick={() => setZoom((current) => Math.min(1.2, current + 0.1))}
            type="button"
          >
            +
          </button>
          <button
            className="ml-2 rounded bg-blue-600 px-3 py-2 text-xs text-white"
            onClick={onAddBlock}
            type="button"
          >
            Add text block
          </button>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-auto bg-slate-200 p-6"
        onClick={(event) => {
          if (event.currentTarget === event.target) {
            setSelectedBlockId(undefined);
          }
        }}
      >
        <div
          className="mx-auto"
          style={{
            width: (A4_PAGE.width + 150) * zoom,
            height: continuousCanvasHeight * zoom,
          }}
        >
          <div
            className="relative origin-top-left"
            style={{
              width: A4_PAGE.width + 150,
              height: continuousCanvasHeight,
              transform: `scale(${zoom})`,
            }}
          >
            <div
              className="absolute left-0 top-0 bg-white shadow-xl"
              style={{
                width: A4_PAGE.width,
                height: continuousCanvasHeight,
              }}
            >
              <div
                className="pointer-events-none absolute border-x border-dashed border-slate-200"
                style={{
                  left: A4_CONTENT.left,
                  top: A4_CONTENT.top,
                  width: A4_CONTENT.width,
                  height: A4_CONTENT.height * pageCount,
                }}
              />
            </div>

            {Array.from({ length: pageCount - 1 }, (_, index) => {
              const nextPage = index + 2;
              const markerTop =
                A4_PAGE.padding + A4_CONTENT.height * (index + 1);

              return (
                <div
                  className="pointer-events-none absolute z-20 flex items-center"
                  key={nextPage}
                  style={{
                    left: A4_PAGE.width - 12,
                    top: markerTop,
                  }}
                >
                  <span className="h-px w-5 bg-rose-500" />
                  <span className="ml-2 whitespace-nowrap rounded bg-rose-600 px-2 py-1 text-[9px] font-medium text-white shadow">
                    Page {nextPage - 1} ends · Page {nextPage} begins
                  </span>
                </div>
              );
            })}

            {placements
              .filter((placement) => !placement.isContinuation)
              .map((placement) => {
                const block = blocks.find(
                  (candidate) => candidate.id === placement.blockId
                );

                if (!block) {
                  return null;
                }

                const continuousTop = toContinuousTop(placement);
                const flowedHeight = getFlowedHeight(block.id);
                const optimisticHeight = optimisticHeights[block.id];
                const canvasPlacement = {
                  ...placement,
                  top: continuousTop + getOptimisticShift(placement),
                  height: Math.max(
                    flowedHeight,
                    optimisticHeight ?? flowedHeight
                  ),
                };

                return (
                  <CanvasBlockElement
                    block={block}
                    key={placement.blockId}
                    onChange={(text) => onUpdateBlock(block.id, { text })}
                    onDelete={() => {
                      onDeleteBlock(block.id);
                      setSelectedBlockId(undefined);
                    }}
                    onFontSizeChange={(fontSize) =>
                      onUpdateBlock(block.id, { fontSize })
                    }
                    onHeightChange={(height) =>
                      setOptimisticHeights((current) =>
                        Math.abs((current[block.id] ?? 0) - height) < 0.5
                          ? current
                          : { ...current, [block.id]: height }
                      )
                    }
                    onSelect={() => setSelectedBlockId(block.id)}
                    onToggleKeepTogether={() =>
                      onUpdateBlock(block.id, {
                        keepTogether: !block.keepTogether,
                      })
                    }
                    placement={canvasPlacement}
                    selected={selectedBlockId === block.id}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
