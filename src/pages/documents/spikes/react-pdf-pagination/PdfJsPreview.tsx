import {
  GlobalWorkerOptions,
  getDocument,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderingCancelledException,
} from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface ScrollAnchor {
  pageNumber: number;
  offsetRatio: number;
}

function captureScrollAnchor(container: HTMLDivElement): ScrollAnchor {
  const pages = Array.from(
    container.querySelectorAll<HTMLElement>('[data-pdf-page]')
  );
  const viewportTop = container.getBoundingClientRect().top;
  const visiblePage =
    pages.find((page) => page.getBoundingClientRect().bottom > viewportTop) ??
    pages.at(-1);

  if (!visiblePage) {
    return { pageNumber: 1, offsetRatio: 0 };
  }

  const pageTop = visiblePage.offsetTop;
  const offsetWithinPage = Math.max(0, container.scrollTop - pageTop);

  return {
    pageNumber: Number(visiblePage.dataset.pdfPage ?? 1),
    offsetRatio: Math.min(1, offsetWithinPage / visiblePage.clientHeight),
  };
}

function restoreScrollAnchor(container: HTMLDivElement, anchor: ScrollAnchor) {
  const page = container.querySelector<HTMLElement>(
    `[data-pdf-page="${anchor.pageNumber}"]`
  );

  if (!page) {
    return;
  }

  container.scrollTop = page.offsetTop + page.clientHeight * anchor.offsetRatio;
}

function PdfCanvasPage({
  document,
  pageNumber,
}: {
  document: PDFDocumentProxy;
  pageNumber: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState<PDFPageProxy>();
  const [aspectRatio, setAspectRatio] = useState(595.28 / 841.89);

  useEffect(() => {
    let active = true;

    document.getPage(pageNumber).then((loadedPage) => {
      if (!active) {
        return;
      }

      const viewport = loadedPage.getViewport({ scale: 1 });
      setAspectRatio(viewport.width / viewport.height);
      setPage(loadedPage);
    });

    return () => {
      active = false;
      setPage(undefined);
    };
  }, [document, pageNumber]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;

    if (!host || !canvas || !page) {
      return;
    }

    let renderTask: ReturnType<PDFPageProxy['render']> | undefined;

    const renderPage = () => {
      renderTask?.cancel();

      const unscaledViewport = page.getViewport({ scale: 1 });
      const cssWidth = host.clientWidth;
      const cssScale = cssWidth / unscaledViewport.width;
      const outputScale = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: cssScale * outputScale });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${viewport.height / outputScale}px`;

      renderTask = page.render({
        canvas,
        viewport,
      });

      renderTask.promise.catch((error) => {
        if (!(error instanceof RenderingCancelledException)) {
          console.error('PDF.js page render failed', error);
        }
      });
    };

    renderPage();

    const resizeObserver = new ResizeObserver(renderPage);
    resizeObserver.observe(host);

    return () => {
      resizeObserver.disconnect();
      renderTask?.cancel();
    };
  }, [page]);

  return (
    <div
      className="relative mx-auto w-full max-w-[794px] overflow-hidden bg-white shadow-lg"
      data-pdf-page={pageNumber}
      ref={hostRef}
      style={{ aspectRatio }}
    >
      <canvas className="block h-full w-full" ref={canvasRef} />
      <div className="pointer-events-none absolute bottom-2 right-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
        Page {pageNumber}
      </div>
    </div>
  );
}

export function PdfJsPreview({
  blob,
  scrollContainerRef,
}: {
  blob?: Blob;
  scrollContainerRef: RefObject<HTMLDivElement>;
}) {
  const [document, setDocument] = useState<PDFDocumentProxy>();
  const pendingAnchorRef = useRef<ScrollAnchor>();

  useEffect(() => {
    if (!blob) {
      return;
    }

    const container = scrollContainerRef.current;

    if (container) {
      pendingAnchorRef.current = captureScrollAnchor(container);
    }

    let active = true;
    let loadedDocument: PDFDocumentProxy | undefined;
    const loadingTaskPromise = blob.arrayBuffer().then((data) => {
      const loadingTask = getDocument({ data });

      return loadingTask.promise;
    });

    loadingTaskPromise.then((nextDocument) => {
      loadedDocument = nextDocument;

      if (active) {
        setDocument(nextDocument);
      } else {
        nextDocument.destroy();
      }
    });

    return () => {
      active = false;

      if (loadedDocument) {
        loadedDocument.destroy();
      }
    };
  }, [blob, scrollContainerRef]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    const anchor = pendingAnchorRef.current;

    if (!container || !anchor || !document) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      restoreScrollAnchor(container, anchor);
      pendingAnchorRef.current = undefined;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [document, scrollContainerRef]);

  if (!document) {
    return (
      <div className="grid min-h-[800px] place-items-center text-white">
        Rendering preview…
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: document.numPages }, (_, index) => (
        <PdfCanvasPage
          document={document}
          key={index + 1}
          pageNumber={index + 1}
        />
      ))}
    </div>
  );
}
