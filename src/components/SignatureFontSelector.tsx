/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef, useState } from 'react';
import { useSignStore } from '$app/_builder/SignStore';
import { useTranslation } from 'react-i18next';

import '@fontsource/dancing-script';
import '@fontsource/great-vibes';
import '@fontsource/pacifico';
import '@fontsource/satisfy';
import '@fontsource/alex-brush';
import classNames from 'classnames';
import { Modal } from './Modal';
import { Button, InputField } from './forms';

const SIGNATURE_FONTS = [
  {
    name: 'Dancing Script',
    value: 'dancing-script',
    fontFamily: 'Dancing Script',
  },
  { name: 'Great Vibes', value: 'great-vibes', fontFamily: 'Great Vibes' },
  { name: 'Pacifico', value: 'pacifico', fontFamily: 'Pacifico' },
  { name: 'Satisfy', value: 'satisfy', fontFamily: 'Satisfy' },
  { name: 'Alex Brush', value: 'alex-brush', fontFamily: 'Alex Brush' },
];

function useAutoScalingFont(text: string, font: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement || !text) return;

    const calculateSize = () => {
      const maxWidth = container.clientWidth - 40; // Increased padding buffer
      const maxHeight = container.clientHeight - 40;

      // Start with a smaller initial size
      let size = 48;

      const updateAndCheckSize = (newSize: number) => {
        textElement.style.fontSize = `${newSize}px`;
        return (
          textElement.scrollWidth <= maxWidth &&
          textElement.scrollHeight <= maxHeight
        );
      };

      // First try the initial size
      if (!updateAndCheckSize(size)) {
        // If too big, decrease size until it fits
        while (size > 4 && !updateAndCheckSize(size)) {
          size -= 1;
        }
      }

      setFontSize(size);
    };

    // Run calculation after a short delay to ensure font is loaded
    const timeoutId = setTimeout(calculateSize, 50);

    // Add resize observer for container size changes
    const resizeObserver = new ResizeObserver(() => {
      // Add a small delay to ensure accurate measurements
      setTimeout(calculateSize, 50);
    });
    resizeObserver.observe(container);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [text, font]);

  return { containerRef, textRef, fontSize };
}

function FontPreviewCard({
  font,
  isSelected,
  previewText,
  onClick,
}: {
  font: (typeof SIGNATURE_FONTS)[0];
  isSelected: boolean;
  previewText: string;
  onClick: () => void;
}) {
  const { containerRef, textRef, fontSize } = useAutoScalingFont(
    previewText,
    font.fontFamily
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'p-6 border rounded-lg transition-all hover:border-primary/50',
        'flex items-center justify-center w-full min-h-[140px]',
        {
          'border-primary bg-primary/5': isSelected,
          'border-border': !isSelected,
        }
      )}
    >
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      >
        <div
          ref={textRef}
          style={{
            fontFamily: font.fontFamily,
            fontSize: `${fontSize}px`,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {previewText || 'Preview'}
        </div>
      </div>
    </button>
  );
}

type SignatureFontSelectorProps = {
  onSignatureCreated?: (signatureImage: string) => void;
  triggerButtonText?: string;
};

export function SignatureFontSelector({
  onSignatureCreated,
  triggerButtonText,
}: SignatureFontSelectorProps) {
  const [t] = useTranslation();
  const [text, setText] = useState('');
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0].value);
  const [isOpen, setIsOpen] = useState(false);
  const updateTemporarySignature = useSignStore(
    (state) => state.updateTemporarySignature
  );

  const currentFont = SIGNATURE_FONTS.find((f) => f.value === selectedFont);

  const handleSubmit = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 600;

    if (ctx) {
      const tempElement = document.createElement('div');
      tempElement.style.fontFamily = currentFont?.fontFamily || '';
      tempElement.style.visibility = 'hidden';
      tempElement.textContent = text;
      document.body.appendChild(tempElement);

      document.fonts.ready.then(() => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Start with a large font size
        let fontSize = 400;
        ctx.font = `${fontSize}px ${currentFont?.fontFamily || ''}`;

        // Measure text and scale down if needed
        let textMetrics = ctx.measureText(text);
        while (textMetrics.width > canvas.width * 0.8 && fontSize > 100) {
          fontSize -= 20;
          ctx.font = `${fontSize}px ${currentFont?.fontFamily || ''}`;
          textMetrics = ctx.measureText(text);
        }

        ctx.fillStyle = 'black';

        // Get vertical metrics
        const fontMetrics = ctx.measureText(text);
        const actualHeight =
          fontMetrics.actualBoundingBoxAscent +
          fontMetrics.actualBoundingBoxDescent;

        // Calculate vertical position to center the text in its actual height
        const y = (canvas.height + actualHeight) / 2;
        const x = (canvas.width - textMetrics.width) / 2;

        // Clear canvas and draw text
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillText(text, x, y);

        // Find the actual bounds of the text
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { left, top, right, bottom } = findTextBounds(imageData);

        // Calculate dimensions with padding
        const padding = 40;
        const contentWidth = right - left + padding * 2;
        const contentHeight = bottom - top + padding * 2;

        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = canvas.width / canvas.height;
        const newHeight = contentHeight;
        const newWidth = Math.max(contentWidth, contentHeight * aspectRatio);

        // Create a new canvas with the cropped dimensions
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCanvas.width = newWidth;
        croppedCanvas.height = newHeight;

        if (croppedCtx) {
          // Draw the cropped portion
          croppedCtx.fillStyle = 'white';
          croppedCtx.fillRect(0, 0, newWidth, newHeight);

          // Center the signature in the new canvas
          const xOffset = (newWidth - contentWidth) / 2;
          croppedCtx.drawImage(
            canvas,
            left - padding,
            top - padding,
            contentWidth,
            contentHeight,
            xOffset,
            0,
            contentWidth,
            contentHeight
          );

          const signatureImage = croppedCanvas.toDataURL('image/png');

          if (onSignatureCreated) {
            onSignatureCreated(signatureImage);
          } else {
            updateTemporarySignature(signatureImage);
            // Dispatch event for new font signature
            window.dispatchEvent(new CustomEvent('signature:font-updated'));
          }
        }

        document.body.removeChild(tempElement);
      });
    }

    setIsOpen(false);
  };

  // Helper function to find the bounds of the text
  function findTextBounds(imageData: ImageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let top = height;
    let bottom = 0;
    let left = width;
    let right = 0;

    // Scan through the image data to find the bounds of non-white pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        // Check if pixel is not white (RGB values all less than 255)
        if (
          data[index] < 255 ||
          data[index + 1] < 255 ||
          data[index + 2] < 255
        ) {
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
          left = Math.min(left, x);
          right = Math.max(right, x);
        }
      }
    }

    return { top, bottom, left, right };
  }

  return (
    <>
      <Button behavior="button">{triggerButtonText || t('customize')}</Button>

      <Modal
        title={t('create_signature')}
        visible={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="grid gap-6 py-6">
          <InputField
            value={text}
            onValueChange={(value) => setText(value)}
            placeholder={t('type_signature')}
          />

          <div className="grid grid-cols-2 gap-4">
            {SIGNATURE_FONTS.map((font) => (
              <FontPreviewCard
                key={font.value}
                font={font}
                isSelected={selectedFont === font.value}
                previewText={text}
                onClick={() => setSelectedFont(font.value)}
              />
            ))}
          </div>

          <Button
            behavior="button"
            onClick={handleSubmit}
            disabled={text.length <= 1}
          >
            {t('use_signature')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
