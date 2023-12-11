/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { Modal } from '$app/components/Modal';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'react-use';

interface Props {
  value?: string;
  onValueChange?: (color: string) => unknown;
  disabled?: boolean;
}

export function ColorPicker(props: Props) {
  const { t } = useTranslation();

  const [color, setColor] = useState(props.value || '#000000');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useDebounce(() => props.onValueChange?.(color), 500, [color]);

  const colors = useColorScheme();

  useEffect(() => {
    props.value && setColor(props.value);
  }, [props.value]);

  return (
    <div>
      <Modal
        title={t('color')}
        visible={isModalOpen}
        onClose={setIsModalOpen}
        centerContent
      >
        <HexColorPicker color={color} onChange={setColor} />
        <HexColorInput
          color={color}
          onChange={setColor}
          className="border rounded-md my-2 p-2 border-gray-300"
          style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
        />
      </Modal>

      <div
        style={{ backgroundColor: color }}
        className={classNames('w-16 h-6 shadow rounded-md', {
          'opacity-75 cursor-not-allowed': props.disabled,
          'cursor-pointer':
            typeof props.disabled === 'undefined' || !props.disabled,
        })}
        onClick={() =>
          (!props.disabled || typeof props.disabled === 'undefined') &&
          setIsModalOpen(true)
        }
      ></div>
    </div>
  );
}
