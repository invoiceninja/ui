/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/forms/Button";
import { Checkbox } from "../components/forms/Checkbox";
import { Input } from "../components/forms/Input";
import { Default } from "../components/layouts/Default";

export function Products() {
  const [t] = useTranslation();

  const people = [
    {
      name: "Jane Cooper",
      title: "Regional Paradigm Technician",
      role: "Admin",
      email: "jane.cooper@example.com",
    },
    // More people...
  ];

  useEffect(() => {
    document.title = t("products");
  });

  return (
    <Default title={t("products")}>
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <Button variant="primary">{t("invoice")}</Button>
            <Button variant="secondary">{t("archive")}</Button>
          </div>
          <div className="flex items-center mt-3 space-x-3 ml-4 -mt-1">
            <Checkbox id="status.active" label={t("active")} />
            <Checkbox id="status.archived" label={t("archived")} />
            <Checkbox id="status.deleted" label={t("deleted")} />
          </div>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <Input placeholder={t("filter")} />
          <Button>{t("new_product")}</Button>
        </div>
      </div>

      <div className="py-2 align-middle inline-block w-full mt-4">
        <div className="overflow-hidden border border-gray-300 sm:rounded-lg overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col"></th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {people.map((person) => (
                <tr key={person.email}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Checkbox />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {person.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {person.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {person.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {person.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href="#"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Default>
  );
}
