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
  onClick: (sectionKey: string) => void;
}

export function TabButton(props: Props) {
  const [t] = useTranslation();

  return (
    <div
      style={{
        borderBottom: props?.active ? '3px solid rgb(47, 125, 195)' : 'none',
      }}
      className="p-3 inline-block cursor-pointer hover:bg-gray-200 text-gray-900"
      onClick={() => props.onClick(props.text)}
    >
      {t(props.text)}
    </div>
  );
}
