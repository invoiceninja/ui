/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from "react-i18next";

export function Table(props: { children?: any }) {
  const [t] = useTranslation();

  return (
    <table className="w-full divide-y divide-gray-200">{props.children}</table>
  );
}

export function Thead(props: { children: any }) {
  return (
    <thead className="bg-gray-50">
      <tr>{props.children}</tr>
    </thead>
  );
}

export function Th(props: { children?: any }) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
    >
      {props.children}
    </th>
  );
}

export function Tbody(props: { children?: any }) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {props.children}
    </tbody>
  );
}

export function Tr(props: { key?: string; children?: any }) {
  return <tr key={props.key}>{props.children}</tr>;
}

export function Td(props: { children?: any }) {
  return (
    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
      {props.children}
    </td>
  );
}
