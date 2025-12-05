declare module 'gridstack' {
  export type GridStackNode = any;

  export interface GridStackInstance {
    on: (event: string, callback: (...args: any[]) => void) => void;
    update: (el: HTMLElement, options: any) => void;
    batchUpdate: () => void;
    commit: () => void;
    destroy: (removeDOM?: boolean) => void;
    setStatic: (staticMode: boolean) => void;
    removeAll: (detachDOM?: boolean) => void;
    load: (layout: any[]) => void;
    engine: {
      nodes: GridStackNode[];
    };
  }

  interface GridStackOptions {
    column?: number;
    cellHeight?: number;
    margin?: number | string;
    float?: boolean;
    disableOneColumnMode?: boolean;
    minRow?: number;
    draggable?: {
      handle?: string;
      ignoreContent?: boolean;
    };
    resizable?: {
      handles?: string;
    };
    animate?: boolean;
  }

  const GridStack: {
    init: (options: GridStackOptions, container: HTMLElement) => GridStackInstance;
  };

  export default GridStack;
}
