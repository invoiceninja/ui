/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { Block } from '../types';
import { generateInvoiceHTML } from '../utils/html-generator';
import { SAMPLE_INVOICE_DATA } from '../utils/variable-replacer';

interface PreviewModalProps {
  blocks: Block[];
  onClose: () => void;
}

export function PreviewModal({ blocks, onClose }: PreviewModalProps) {
  const [zoom, setZoom] = useState(100);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
            <p className="text-sm text-gray-500 mt-1">
              Preview with sample data
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-2 hover:bg-gray-100 rounded"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                className="p-2 hover:bg-gray-100 rounded"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
            >
              Print
            </button>

            <button
              onClick={handleDownloadHTML}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download HTML
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div
            className="mx-auto bg-white shadow-lg"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
            }}
          >
            <iframe
              srcDoc={html}
              className="w-full border-0"
              style={{
                width: '794px',
                height: '1122px', // A4 at 96dpi
                minHeight: '1122px',
              }}
              title="Invoice Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">{blocks.length}</span> blocks in design
            </div>
            <div>
              Preview uses sample data • Actual invoices will use real client and invoice data
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
