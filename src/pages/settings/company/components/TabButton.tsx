/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';

interface Props {
  active: boolean;
  text: string;
  onClick: () => void;
}

export function TabButton(props: Props) {
  const [t] = useTranslation();

  return (
    <div
      style={{
        borderBottom: props?.active ? '3px solid white' : 'none',
      }}
      className="p-3 pt-4 inline-block cursor-pointer hover:bg-gray-50 hover:bg-opacity-10 text-white"
      onClick={props.onClick}
    >
      {t(props.text)}
    </div>
  );
}
