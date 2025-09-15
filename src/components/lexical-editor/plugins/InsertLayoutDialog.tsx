/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { JSX } from 'react';

import { LexicalEditor } from 'lexical';
import * as React from 'react';
import { useState } from 'react';

import Button from '../components/Button';
import DropDown, { DropDownItem } from '../components/Dropdown';
import { INSERT_LAYOUT_COMMAND } from './LayoutPlugin';

const LAYOUTS = [
  { label: '2 columns (equal width)', value: '1fr 1fr' },
  { label: '2 columns (25% - 75%)', value: '1fr 3fr' },
  { label: '3 columns (equal width)', value: '1fr 1fr 1fr' },
  { label: '3 columns (25% - 50% - 25%)', value: '1fr 2fr 1fr' },
  { label: '4 columns (equal width)', value: '1fr 1fr 1fr 1fr' },
];

export default function InsertLayoutDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const [layout, setLayout] = useState(LAYOUTS[0].value);
  const buttonLabel = LAYOUTS.find((item) => item.value === layout)?.label;

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout);
    onClose();
  };

  return (
    <>
      <DropDown
        buttonClassName="toolbar-item dialog-dropdown"
        buttonLabel={buttonLabel}
      >
        {LAYOUTS.map(({ label, value }) => (
          <DropDownItem
            key={value}
            className="item"
            onClick={() => setLayout(value)}
          >
            <span className="text">{label}</span>
          </DropDownItem>
        ))}
      </DropDown>
      <Button onClick={onClick}>Insert</Button>
    </>
  );
}
