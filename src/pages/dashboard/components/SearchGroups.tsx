/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SearchRecord } from '$app/common/interfaces/search';
import { Entry } from '$app/components/forms/Combobox';
import { SetStateAction } from 'react';
import { Dispatch } from 'react';
import { SearchGroupTitle } from './SearchGroupTitle';
import { SearchItem } from './SearchItem';

interface Groups {
  clients: Entry<SearchRecord>[];
  invoices: Entry<SearchRecord>[];
  recurring_invoices: Entry<SearchRecord>[];
  payments: Entry<SearchRecord>[];
  quotes: Entry<SearchRecord>[];
  credits: Entry<SearchRecord>[];
  projects: Entry<SearchRecord>[];
  tasks: Entry<SearchRecord>[];
  purchase_orders: Entry<SearchRecord>[];
  settings: Entry<SearchRecord>[];
  other: Entry<SearchRecord>[];
}

interface Props {
  groups: Groups;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  isContainerScrolling: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function SearchGroups({
  groups,
  selectedIndex,
  setSelectedIndex,
  isContainerScrolling,
  setIsModalOpen,
}: Props) {
  let currentIndex = 0;

  return (
    <>
      <SearchGroupTitle
        title="clients"
        hasResults={groups.clients.length > 0}
      />
      {groups.clients.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}

      <SearchGroupTitle
        title="invoices"
        hasResults={groups.invoices.length > 0}
      />
      {groups.invoices.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}

      <SearchGroupTitle
        title="recurring_invoices"
        hasResults={groups.recurring_invoices.length > 0}
      />
      {groups.recurring_invoices.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}

      <SearchGroupTitle
        title="payments"
        hasResults={groups.payments.length > 0}
      />
      {groups.payments.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}

      <SearchGroupTitle title="quotes" hasResults={groups.quotes.length > 0} />
      {groups.quotes.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}

      <SearchGroupTitle
        title="credits"
        hasResults={groups.credits.length > 0}
      />
      {groups.credits.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}

      <SearchGroupTitle
        title="projects"
        hasResults={groups.projects.length > 0}
      />
      {groups.projects.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}

      <SearchGroupTitle title="tasks" hasResults={groups.tasks.length > 0} />
      {groups.tasks.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}

      <SearchGroupTitle
        title="purchase_orders"
        hasResults={groups.purchase_orders.length > 0}
      />
      {groups.purchase_orders.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}

      <SearchGroupTitle
        title="settings"
        hasResults={groups.settings.length > 0}
      />
      {groups.settings.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}

      <SearchGroupTitle title="other" hasResults={groups.other.length > 0} />
      {groups.other.map((entry) => {
        const index = currentIndex++;

        return (
          <SearchItem
            key={entry.id}
            entry={entry}
            index={index}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            isContainerScrolling={isContainerScrolling}
            setIsModalOpen={setIsModalOpen}
          />
        );
      })}
    </>
  );
}
