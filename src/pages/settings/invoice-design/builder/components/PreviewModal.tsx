/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { Download, ZoomIn, ZoomOut, Printer } from 'lucide-react';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { useColorScheme } from '$app/common/colors';
import { Block } from '../types';
import { generateInvoiceHTML } from '../utils/html-generator';
import { SAMPLE_INVOICE_DATA } from '../utils/variable-replacer';

interface PreviewModalProps {
  blocks: Block[];
  onClose: () => void;
}

export function PreviewModal({ blocks, onClose }: PreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const colors = useColorScheme();
  const html = generateInvoiceHTML(blocks, SAMPLE_INVOICE_DATA);

  const handleDownloadHTML = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-preview-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <Modal
      visible={true}
      onClose={onClose}
      title="Invoice Preview"
      size="large"
      overflowVisible
      enableClosingOnXMark
    >
      <div
        className="flex flex-col"
        style={{ minHeight: '600px', maxHeight: '80vh' }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between py-3 border-b"
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <Button
                type="secondary"
                behavior="button"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-2"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span
                className="text-sm font-medium min-w-[60px] text-center"
                style={{ color: colors.$3 }}
              >
                {zoom}%
              </span>
              <Button
                type="secondary"
                behavior="button"
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="p-2"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-6 w-px" style={{ backgroundColor: colors.$24 }} />

            <span className="text-sm" style={{ color: colors.$17 }}>
              Preview uses sample data
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="secondary"
              behavior="button"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>

            <Button
              type="primary"
              behavior="button"
              onClick={handleDownloadHTML}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download HTML
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div
          className="flex-1 overflow-auto py-6 -mx-5 px-5"
          style={{ backgroundColor: colors.$23 }}
        >
          <div
            className="mx-auto shadow-lg"
            style={{
              backgroundColor: colors.$1,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              width: 'fit-content',
            }}
          >
            <iframe
              srcDoc={html}
              className="border-0 block"
              style={{
                width: '794px',
                height: '1122px',
                minHeight: '1122px',
                backgroundColor: colors.$1,
              }}
              title="Invoice Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="py-3 border-t flex items-center justify-between text-sm -mx-5 px-5 -mb-5"
          style={{ borderColor: colors.$24, color: colors.$17 }}
        >
          <span>
            <strong style={{ color: colors.$3 }}>{blocks.length}</strong> blocks
            in design
          </span>
          <span>Actual invoices will use real client and invoice data</span>
        </div>
      </div>
    </Modal>
  );
}
