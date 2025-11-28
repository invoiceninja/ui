import { NumberInputField } from '$app/components/forms/NumberInputField';
import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  onValueChange: (value: string) => unknown;
  disabled: boolean;
  errorMessage: string[] | undefined;
}

export function TableNumberInputField({
  value,
  onValueChange,
  disabled,
  errorMessage = [],
}: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  const [divWidth, setDivWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const errorMessageBox = document.querySelector('.input-field-with-errors');

    if (errorMessageBox) {
      errorMessageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorMessage]);

  useEffect(() => {
    if (!divRef.current) return;

    setDivWidth(divRef.current.clientWidth);
  }, []);

  return (
    <div className="flex flex-col gap-y-2" ref={divRef}>
      <NumberInputField
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />

      {errorMessage.length > 0 && divWidth && (
        <div
          className="text-red-500 text-xs break-words whitespace-pre-wrap"
          style={{
            maxWidth: divWidth,
          }}
        >
          {errorMessage.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>
      )}
    </div>
  );
}
