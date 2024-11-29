import React, { useState, useEffect } from 'react';
import { X } from 'react-feather';
import { FaSignature } from 'react-icons/fa';
import { Document, Page } from 'react-pdf';
import { Rnd, RndDragCallback, RndResizeCallback } from 'react-rnd';

interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function SignatureDnd() {
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [currentRect, setCurrentRect] = useState<Rectangle | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest('.existing-rectangle') ||
        e.target.closest('.close-button'))
    ) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPoint({ x, y });
    setCurrentRect({ id: '', x, y, width: 0, height: 0 });
    setIsDrawing(true);
    setFocusedId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - startPoint.x;
    const height = y - startPoint.y;

    setCurrentRect({
      id: '',
      x: width < 0 ? x : startPoint.x,
      y: height < 0 ? y : startPoint.y,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };

  const handleMouseUp = () => {
    const minWidth = 20;
    const minHeight = 20;

    if (
      currentRect &&
      Math.abs(currentRect.width) >= minWidth &&
      Math.abs(currentRect.height) >= minHeight
    ) {
      const newRectangle: Rectangle = {
        ...currentRect,
        id: crypto.randomUUID(),
      };
      setRectangles((prev) => [...prev, newRectangle]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  };

  const removeRectangle = (
    id: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    setRectangles((prev) => prev.filter((rect) => rect.id !== id));
    if (focusedId === id) {
      setFocusedId(null);
    }
  };

  const handleDragStop: RndDragCallback = (e, data) => {
    const id = (e.target as HTMLElement).dataset.id!;
    setRectangles((prev) =>
      prev.map((rect) =>
        rect.id === id
          ? {
              ...rect,
              x: data.x,
              y: data.y,
            }
          : rect
      )
    );
  };

  const handleResizeStop: RndResizeCallback = (
    e,
    direction,
    ref,
    delta,
    position
  ) => {
    const id = (e.target as HTMLElement).dataset.id!;
    setRectangles((prev) =>
      prev.map((rect) =>
        rect.id === id
          ? {
              ...rect,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              x: position.x,
              y: position.y,
            }
          : rect
      )
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !(e.target instanceof HTMLElement) ||
        !e.target.closest('.relative')
      ) {
        setFocusedId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-start gap-5 p-5">
      <div></div>

      <div
        className="relative border"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Document
          file="https://pdfobject.com/pdf/sample.pdf"
          className="cursor-crosshair"
        >
          <Page
            pageNumber={1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            scale={1.5}
          />
        </Document>

        {rectangles.map((rect) => (
          <Rnd
            key={rect.id}
            default={{
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            }}
            bounds="parent"
            enableResizing={focusedId === rect.id}
            onDragStop={(e, data) => handleDragStop(e, data)}
            onResizeStop={(e, direction, ref, delta, position) =>
              handleResizeStop(e, direction, ref, delta, position)
            }
            className={`bg-red-300/25 border ${
              focusedId === rect.id ? 'border-red-800' : 'border-gray-500'
            } existing-rectangle`}
            onMouseDown={(e) => {
              e.stopPropagation();
              setFocusedId(rect.id);
            }}
          >
            <div
              className="relative h-full flex items-center justify-center"
              data-id={rect.id}
            >
              {focusedId === rect.id && (
                <>
                  <div className="absolute -top-8 left-0 bg-red-800 text-white text-sm px-2 py-1 rounded">
                    Signature
                  </div>
                  <button
                    className="absolute -top-8 right-0 bg-red-800 text-white p-1 text-sm rounded close-button"
                    onClick={(e) => removeRectangle(rect.id, e)}
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-800 rounded-full transform translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
                </>
              )}

              <div className="text-center text-sm text-red-800 font-semibold">
                <FaSignature size={24} />
              </div>
            </div>
          </Rnd>
        ))}

        {currentRect && (
          <div
            style={{
              position: 'absolute',
              left: currentRect.x,
              top: currentRect.y,
              width: currentRect.width,
              height: currentRect.height,
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              border: '1px solid red',
              pointerEvents: 'none',
            }}
          ></div>
        )}
      </div>

      <div className="w-auto bg-white border p-5 overflow-auto">
        <h3 className="text-lg font-semibold">Signatures</h3>
        {rectangles.map((rect) => (
          <div key={rect.id} className="py-2">
            <div>
              <strong>ID:</strong> {rect.id}
            </div>
            <div>
              <strong>X:</strong> {rect.x}
            </div>
            <div>
              <strong>Y:</strong> {rect.y}
            </div>
            <div>
              <strong>Width:</strong> {rect.width}
            </div>
            <div>
              <strong>Height:</strong> {rect.height}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
