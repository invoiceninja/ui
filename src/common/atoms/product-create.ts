/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom } from 'jotai';

// Controls visibility of the inline ProductCreate modal rendered by ProductSelector.
// Exposed as an atom so external flows (e.g. the simplified invoice editor's
// "first add_item click" onboarding) can open the modal without holding a ref
// to the selector.
export const productCreateModalAtom = atom<boolean>(false);
