/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { produce } from 'immer';
import { create } from 'zustand';
import { User } from '$app/common/interfaces/docuninja/api';
import { ClientContact } from '$app/common/interfaces/docuninja/api';

type State = {
  temporarySignature: string | null;
  signatures: Record<string, string | null>;
  dates: Record<string, string>;
  inputs: Record<string, string>;
  checkboxes: Record<string, boolean>;
  signatory: User | ClientContact | null;
};

type Actions = {
  createOrUpdateSignature: (id: string, signature: string | null) => void;
  findSignature: (id: string) => string | null;
  updateTemporarySignature: (signature: string) => void;
  createOrUpdateDate: (id: string, value: string) => void;
  createOrUpdateInput: (id: string, value: string) => void;
  createOrUpdateCheckbox: (id: string, value: boolean) => void;
  updateSignatory: (user: User | ClientContact) => void;
};

export type SignStore = State & Actions;

export const useSignStore = create<SignStore>()((set, get) => ({
  temporarySignature: null,
  signatures: {},
  dates: {},
  inputs: {},
  checkboxes: {},
  signatory: null,
  createOrUpdateSignature: (id: string, signature: string | null) => {
    set(
      produce((draft: State) => {
        draft.signatures[id] = signature;
      })
    );
  },
  findSignature: (id: string) => get().signatures[id],
  updateTemporarySignature: (signature: string) => {
    set(
      produce((draft: State) => {
        draft.temporarySignature = signature;
      })
    );
  },
  createOrUpdateDate: (id: string, value: string) => {
    set((state) => ({ dates: { ...state.dates, [id]: value } }));
  },
  createOrUpdateInput: (id: string, value: string) => {
    set((state) => ({ inputs: { ...state.inputs, [id]: value } }));
  },
  createOrUpdateCheckbox: (id: string, value: boolean) => {
    set((state) => ({ checkboxes: { ...state.checkboxes, [id]: value } }));
  },
  updateSignatory: (user: User | ClientContact) => {
    set(
      produce((draft: State) => {
        draft.signatory = user;
      })
    );
  },
}));
