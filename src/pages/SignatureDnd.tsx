import React, { useState, useRef } from 'react';
import { Document, Page } from 'react-pdf';

export function SignatureDnd() {
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const isDrawingRef = useRef(false);
  const containerRef = useRef(null);
  const resizeStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const bounds = container.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    if (
      mouseX >= rect.x + rect.width - 10 &&
      mouseX <= rect.x + rect.width &&
      mouseY >= rect.y + rect.height - 10 &&
      mouseY <= rect.y + rect.height
    ) {
      resizeStartPos.current = { x: mouseX, y: mouseY };
      setIsResizing(true);
    } else if (
      mouseX >= rect.x &&
      mouseX <= rect.x + rect.width &&
      mouseY >= rect.y &&
      mouseY <= rect.y + rect.height
    ) {
      setStartPos({ x: mouseX, y: mouseY });
      setIsDragging(true);
    } else {
      setStartPos({ x: mouseX, y: mouseY });
      setRect({ x: mouseX, y: mouseY, width: 0, height: 0 });
      isDrawingRef.current = true;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const bounds = container.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    const containerWidth = bounds.width;
    const containerHeight = bounds.height;

    if (isDragging) {
      const dx = mouseX - startPos.x;
      const dy = mouseY - startPos.y;

      const newX = Math.max(0, Math.min(rect.x + dx, containerWidth - rect.width));
      const newY = Math.max(0, Math.min(rect.y + dy, containerHeight - rect.height));

      setRect((prevRect) => ({
        ...prevRect,
        x: newX,
        y: newY,
      }));
      setStartPos({ x: mouseX, y: mouseY });
    } else if (isResizing) {
      const dx = mouseX - resizeStartPos.current.x;
      const dy = mouseY - resizeStartPos.current.y;

      const newWidth = Math.max(0, rect.width + dx);
      const newHeight = Math.max(0, rect.height + dy);

      setRect({
        ...rect,
        width: newWidth,
        height: newHeight,
      });

      resizeStartPos.current = { x: mouseX, y: mouseY };
    } else if (isDrawingRef.current) {
      const newWidth = Math.max(0, Math.min(mouseX - rect.x, containerWidth - rect.x));
      const newHeight = Math.max(0, Math.min(mouseY - rect.y, containerHeight - rect.y));

      setRect({
        x: rect.x,
        y: rect.y,
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    isDrawingRef.current = false;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsResizing(false);
    isDrawingRef.current = false;
  };

  return (
    <div
      className="relative flex items-start"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div id="placeholder" className="relative">
        <Document file="https://pdfobject.com/pdf/sample.pdf">
          <Page pageNumber={1} scale={1.2} renderTextLayer={false} />
        </Document>
      </div>

      <div
        className="absolute border border-dashed border-black"
        style={{
          top: `${rect.y}px`,
          left: `${rect.x}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          backgroundColor: 'rgba(173, 216, 230, 0.5)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-5px',
            left: '-5px',
            width: '10px',
            height: '10px',
            backgroundColor: 'blue',
            borderRadius: '50%',
            cursor: 'se-resize',
          }}
        ></div>
      </div>

      <div
        className="absolute top-0 right-0 p-4 bg-white border border-gray-300"
        style={{
          width: '200px',
          top: '10px',
          right: '10px',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        <div>
          <strong>X:</strong> {rect.x.toFixed(2)}
        </div>
        <div>
          <strong>Y:</strong> {rect.y.toFixed(2)}
        </div>
        <div>
          <strong>Width:</strong> {rect.width.toFixed(2)}
        </div>
        <div>
          <strong>Height:</strong> {rect.height.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
