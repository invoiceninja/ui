import React, { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '$app/resources/css/gridLayout.css';

import { Activity } from '$app/pages/dashboard/components/Activity';
import { PastDueInvoices } from '$app/pages/dashboard/components/PastDueInvoices';
import { RecentPayments } from '$app/pages/dashboard/components/RecentPayments';
import { UpcomingInvoices } from '$app/pages/dashboard/components/UpcomingInvoices';
import { ModuleBitmask } from '$app/pages/settings';
import { ExpiredQuotes } from './ExpiredQuotes';
import { UpcomingQuotes } from './UpcomingQuotes';
import { UpcomingRecurringInvoices } from './UpcomingRecurringInvoices';
import { useEnabled } from '$app/common/guards/guards/enabled';

const GridLayoutComponent = () => {
  const enabled = useEnabled();
  const [width, setWidth] = useState<number>(1000);
  const [columns, setColumns] = useState<number>(4);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const handleColumnsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setColumns(parseInt(event.target.value));
  };

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="columns">Choose number of columns: </label>
        <select id="columns" value={columns} onChange={handleColumnsChange}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>

      <GridLayout
        className="layout"
        cols={12} // 12-column layout
        width={width}
        draggableHandle=".drag-handle"
        margin={[10, 10]} // 10px margin for spacing
      >
        <div
          key="1"
          className="drag-handle"
          data-grid={{
            x: 0,
            y: 0,
            w: 6,
            h: 2.2,
            isResizable: true,
            resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
          }}
        >
          <Activity />
        </div>

        <div
          key="2"
          className="drag-handle"
          data-grid={{
            x: 6,
            y: 0,
            w: 6,
            h: 2.2,
            isResizable: true,
            resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
          }}
        >
          <RecentPayments />
        </div>

        {enabled(ModuleBitmask.Invoices) && (
          <div
            key="3"
            className="drag-handle"
            data-grid={{
              x: 0,
              y: 1,
              w: 6,
              h: 2.2,
              isResizable: true,
            }}
          >
            <UpcomingInvoices />
          </div>
        )}

        {enabled(ModuleBitmask.Invoices) && (
          <div
            key="4"
            className="drag-handle"
            data-grid={{
              x: 6,
              y: 1,
              w: 6,
              h: 2.2,
              isResizable: true,
            }}
          >
            <PastDueInvoices />
          </div>
        )}

        {enabled(ModuleBitmask.Quotes) && (
          <div
            key="5"
            className="drag-handle"
            data-grid={{
              x: 0,
              y: 2,
              w: 6,
              h: 2.2,
              isResizable: true,
            }}
          >
            <ExpiredQuotes />
          </div>
        )}

        {enabled(ModuleBitmask.Quotes) && (
          <div
            key="6"
            className="drag-handle"
            data-grid={{
              x: 6,
              y: 2,
              w: 6,
              h: 2.2,
              isResizable: true,
            }}
          >
            <UpcomingQuotes />
          </div>
        )}

        {enabled(ModuleBitmask.RecurringInvoices) && (
          <div
            key="7"
            className="drag-handle"
            data-grid={{
              x: 0,
              y: 3,
              w: 6,
              h: 2.2,
              isResizable: true,
            }}
          >
            <UpcomingRecurringInvoices />
          </div>
        )}
      </GridLayout>
    </div>
  );
};

export default GridLayoutComponent;
