/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useBuilderStore } from '@docuninja/builder2.0';
import { useEffect } from 'react';
import { isEmbedded, postToHost } from '$app/common/helpers/embed';

/**
 * Embedded in the Invoice Ninja app (`common/helpers/embed.ts`): reports
 * what the builder does, so the app can refresh the document, close the
 * builder after a send, and ask before discarding unsaved work.
 *
 * "Unsaved" compares what a save sends (the fields, the signers and their
 * order, the files' order) with a baseline taken when the document first
 * loads and after each save; the builder keeps no flag of its own. It
 * reloads the document on its own (previews arriving), restoring local
 * edits, so a later `builder:loaded` keeps the baseline.
 */
export function useEmbeddedBuilderEvents(id: string | undefined) {
  useEffect(() => {
    if (!isEmbedded()) {
      return;
    }

    const snapshot = () => {
      const state = useBuilderStore.getState();

      return JSON.stringify({
        rectangles: state.rectangles ?? {},
        signatories: state.signatories ?? [],
        signatoryOrder: state.signatoryOrder ?? [],
        signatoryMetadata: state.signatoryMetadata ?? {},
        filesOrder: state.filesOrder ?? [],
      });
    };

    let saved: string | null = null;
    let dirty = false;
    let pending: number | undefined;

    const report = () => {
      if (saved === null) {
        return;
      }

      const now = snapshot() !== saved;

      if (now !== dirty) {
        dirty = now;
        postToHost('dirty', { dirty });
      }
    };

    // A drag changes the store on every frame: compare once it settles.
    const scheduleReport = () => {
      window.clearTimeout(pending);
      pending = window.setTimeout(report, 250);
    };

    // The builder reloads the document on its own (previews arriving, the
    // refetch after a save), restoring local edits and rebuilding the order
    // and files from the server. With nothing unsaved that reload is the new
    // baseline; with edits it keeps the old one, so they still count.
    const onLoaded = () => {
      if (saved === null || !dirty) {
        saved = snapshot();
      }

      report();
      postToHost('loaded', { documentId: id });
    };

    const onSaved = () => {
      saved = snapshot();
      report();
      postToHost('saved', { documentId: id });
    };

    const listeners: [string, () => void][] = [
      ['builder:loaded', onLoaded],
      ['builder:document.successfully.saved', onSaved],
      ['builder:save.error', () => postToHost('saveError')],
      ['builder:document.sent', () => postToHost('sent', { documentId: id })],
      ['builder:send.error', () => postToHost('sendError')],
      [
        'builder:document.updated',
        () => postToHost('documentUpdated', { documentId: id }),
      ],
    ];

    listeners.forEach(([name, fn]) => window.addEventListener(name, fn));

    const unsubscribe = useBuilderStore.subscribe(scheduleReport);

    return () => {
      listeners.forEach(([name, fn]) => window.removeEventListener(name, fn));
      unsubscribe();
      window.clearTimeout(pending);

      // Leaving the builder (to the sign page, say): its edits are gone with
      // it, so the host must not ask about them.
      if (dirty) {
        postToHost('dirty', { dirty: false });
      }
    };
  }, [id]);
}
