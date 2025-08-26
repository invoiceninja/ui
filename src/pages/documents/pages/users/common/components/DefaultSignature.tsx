/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';

type SignaturePadProps = {
  width: number;
  onChange?: (signature: string) => void;
  defaultValue?: string;
};

export function DefaultSignature({
  width,
  onChange,
  defaultValue,
}: SignaturePadProps) {
  const signature = useRef<SignaturePad | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;

    const pad = new SignaturePad(element);

    if (defaultValue) {
      pad.fromDataURL(defaultValue);
    }

    pad.addEventListener('endStroke', () => {
      onChange?.(pad.toDataURL());
    });

    signature.current = pad;

    return () => {
      pad.removeEventListener('endStroke', () => {
        onChange?.(pad.toDataURL());
      });
      signature.current = null;
    };
  }, []);

  return (
    <div>
      <canvas ref={canvas} width={width} className="border" />
      <div className="flex justify-end mt-2" />
    </div>
  );
}
