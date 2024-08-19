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

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <GridLayout cols={24} width={width} draggableHandle=".drag-handle">
        <div
          key="1"
          className="drag-handle"
          data-grid={{
            x: 0,
            y: 0,
            w: 12,
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
            x: 12,
            y: 0,
            w: 12,
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
              w: 12,
              h: 2.2,
              isResizable: true,
              resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
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
              x: 12,
              y: 1,
              w: 12,
              h: 2.2,
              isResizable: true,
              resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
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
              w: 12,
              h: 2.2,
              isResizable: true,
              resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
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
              x: 12,
              y: 2,
              w: 12,
              h: 2.2,
              isResizable: true,
              resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
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
              w: 12,
              h: 2.2,
              isResizable: true,
              resizeHandles: ['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'],
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
