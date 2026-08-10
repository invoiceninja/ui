/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import type { CSSProperties } from 'react';
import type { SignatureBlock } from '../types';
import { ensurePx } from '../utils/html-generator';

function asTextAlign(align?: string): CSSProperties['textAlign'] {
  return (align as CSSProperties['textAlign']) || 'left';
}

interface SignatureBlockRendererProps {
  block: SignatureBlock;
}

export function SignatureBlockRenderer({ block }: SignatureBlockRendererProps) {
  const { t } = useTranslation();
  const {
    label,
    showDate,
    align,
    fontSize,
    fontWeight,
    fontStyle,
    color,
    padding,
  } = block.properties;
  const showLine = block.properties.showLine !== false;
  const signatureHeight = ensurePx(block.properties.signatureHeight) || '40px';
  const lineWidth = ensurePx(block.properties.lineWidth) || '200px';
  const lineThickness = ensurePx(block.properties.lineThickness) || '1px';
  const lineStyleValue = block.properties.lineStyle;
  const lineStyle = ['solid', 'dashed', 'dotted'].includes(lineStyleValue || '')
    ? lineStyleValue
    : 'solid';
  const lineColor = block.properties.lineColor || '#000000';

  return (
    <div
      style={{
        textAlign: asTextAlign(align),
        padding: ensurePx(padding),
        boxSizing: 'border-box',
      }}
    >
      <div aria-hidden="true" style={{ height: signatureHeight }} />
      {showLine && (
        <div
          style={{
            borderTop: `${lineThickness} ${lineStyle} ${lineColor}`,
            width: lineWidth,
            maxWidth: '100%',
            marginBottom: '8px',
            display: 'inline-block',
          }}
        />
      )}
      <div style={{ fontSize, fontWeight, fontStyle, color }}>
        {label ?? ''}
      </div>
      {showDate && (
        <div
          style={{ fontSize, fontWeight, fontStyle, color, marginTop: '4px' }}
        >
          {String(t('date') || 'Date')}: ________________
        </div>
      )}
    </div>
  );
}
