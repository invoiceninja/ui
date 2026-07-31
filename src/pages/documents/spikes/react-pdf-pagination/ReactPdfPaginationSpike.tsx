import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CanvasBlock, EditorCanvas } from './EditorCanvas';
import {
  extractPaginationFeedback,
  PaginationFeedback,
  ReactPdfLayoutNode,
} from './layout-feedback';
import { PdfJsPreview } from './PdfJsPreview';
import { A4_PAGE } from './page-geometry';

const DEFAULT_TEXT =
  'React PDF is the layout authority. Edit this text or add blocks to force the content across page boundaries.';

type EditorBlock = CanvasBlock;

interface InternalOnRenderProps {
  _INTERNAL__LAYOUT__DATA_?: ReactPdfLayoutNode;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: A4_PAGE.padding,
    paddingRight: A4_PAGE.padding,
    paddingBottom: A4_PAGE.padding,
    paddingLeft: A4_PAGE.padding,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.35,
  },
  block: {
    marginBottom: 14,
    padding: 8,
    border: '1pt solid #d1d5db',
  },
  blockLabel: {
    marginBottom: 4,
    color: '#64748b',
    fontSize: 8,
  },
});

function SpikeDocument({
  blocks,
  onLayout,
}: {
  blocks: EditorBlock[];
  onLayout: (layout: ReactPdfLayoutNode | undefined) => void;
}) {
  return (
    <Document
      onRender={(props) =>
        onLayout(
          (props as typeof props & InternalOnRenderProps)
            ._INTERNAL__LAYOUT__DATA_
        )
      }
    >
      <Page size="A4" style={styles.page} wrap>
        {blocks.map((block) => (
          <View
            id={block.id}
            key={block.id}
            style={[styles.block, { fontSize: block.fontSize }]}
            wrap={!block.keepTogether}
          >
            <Text style={styles.blockLabel}>{block.id}</Text>
            <Text id={`${block.id}-content`}>{block.text}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export default function ReactPdfPaginationSpike() {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    Array.from({ length: 7 }, (_, index) => ({
      id: `block-${index + 1}`,
      text: `${DEFAULT_TEXT} `.repeat(index === 2 ? 10 : 4),
      keepTogether: false,
      fontSize: 12,
    }))
  );
  const [feedback, setFeedback] = useState<PaginationFeedback>();
  const [previewBlob, setPreviewBlob] = useState<Blob>();
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string>();
  const previewScrollRef = useRef<HTMLDivElement>(null);

  const document = useMemo(
    () => (
      <SpikeDocument
        blocks={blocks}
        onLayout={(layout) => setFeedback(extractPaginationFeedback(layout))}
      />
    ),
    [blocks]
  );

  useEffect(() => {
    let active = true;

    const timeout = window.setTimeout(async () => {
      setIsRendering(true);
      setError(undefined);

      try {
        const blob = await pdf(document).toBlob();

        if (!active) {
          return;
        }

        setPreviewBlob(blob);
      } catch (renderError) {
        if (active) {
          setError(
            renderError instanceof Error
              ? renderError.message
              : 'PDF rendering failed'
          );
        }
      } finally {
        if (active) {
          setIsRendering(false);
        }
      }
    }, 150);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [document]);

  const updateBlock = (id: string, patch: Partial<EditorBlock>) => {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, ...patch } : block))
    );
  };

  const addBlock = () => {
    setBlocks((current) => {
      const nextId =
        Math.max(
          0,
          ...current.map((block) => Number(block.id.replace('block-', '')) || 0)
        ) + 1;

      return [
        ...current,
        {
          id: `block-${nextId}`,
          text: DEFAULT_TEXT.repeat(3),
          keepTogether: false,
          fontSize: 12,
        },
      ];
    });
  };

  const deleteBlock = (id: string) => {
    setBlocks((current) => current.filter((block) => block.id !== id));
  };

  return (
    <div className="grid h-screen min-h-[760px] grid-cols-1 gap-3 bg-slate-100 p-3 xl:grid-cols-2">
      <section className="flex min-h-0 flex-col overflow-hidden rounded-lg bg-white shadow">
        {(error || isRendering) && (
          <div
            className={`px-4 py-2 text-xs ${
              error ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
            }`}
          >
            {error ?? 'Updating authoritative PDF layout…'}
          </div>
        )}
        <EditorCanvas
          blocks={blocks}
          feedback={feedback}
          onAddBlock={addBlock}
          onDeleteBlock={deleteBlock}
          onUpdateBlock={updateBlock}
        />
      </section>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-lg bg-slate-700 shadow">
        <div className="flex flex-wrap gap-2 border-b border-slate-600 p-3 text-xs text-white">
          {feedback?.placements.map((placement) => (
            <span
              className={`rounded px-2 py-1 ${
                placement.isContinuation ? 'bg-amber-600' : 'bg-slate-600'
              }`}
              key={`${placement.blockId}-${placement.pageNumber}`}
            >
              {placement.blockId} → p{placement.pageNumber} @{' '}
              {placement.top.toFixed(1)}pt
            </span>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-auto" ref={previewScrollRef}>
          <PdfJsPreview
            blob={previewBlob}
            scrollContainerRef={previewScrollRef}
          />
        </div>
      </section>
    </div>
  );
}
