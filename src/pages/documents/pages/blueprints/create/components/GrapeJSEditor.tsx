/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '$app/components/forms';
import { useColorScheme } from '$app/common/colors';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import * as beautify from 'js-beautify';
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Custom CSS for larger icons in GrapeJS
const iconStyles = `

.gjs-block {
    align-items: center !important;
    justify-content: center !important;
    min-height: 50px !important;
    font-size: 14px !important;
    border-radius: 8px !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
    position: relative !important;
    overflow: hidden !important;
}

/* Override default GrapeJS block styling - remove these generic rules */

/* Hover effects */
.gjs-block:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
}

/* Icon styling */
.gjs-block i {
    font-size: 24px !important;
    width: 24px !important;
    height: 24px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin-bottom: 4px !important;
}

.gjs-block i.fas {
    font-size: 24px !important;
    width: 24px !important;
    height: 24px !important;
}

.gjs-sm-sector-title i.fas {
    font-size: 18px !important;
}

.gjs-pn-btn i.fas {
    font-size: 18px !important;
}

.gjs-block__media {
    font-size: 24px !important;
    width: 24px !important;
    height: 24px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin-bottom: 4px !important;
}

.gjs-block-label {
    font-size: 12px !important;
    font-weight: 600 !important;
    text-align: center !important;
    line-height: 1.2 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
}

/* Specific styling for custom placeholder blocks - all same color */
.gjs-block.gjs-one-bg,
.gjs-block.gjs-four-color-h,
.gjs-block {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border: none !important;
}

/* Default GrapeJS block styling 
.gjs-block.gjs-one-bg {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
    color: #333 !important;
    border: none !important;
}

.gjs-block.gjs-four-color-h {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
    color: #333 !important;
    border: none !important;
}
*/

/* Category-specific styling for other blocks */
.gjs-blocks-cs .gjs-block[data-category="Basic"] {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%) !important;
}

/* Draggable rectangle specific styles */
.draggable-rectangle, .gjs-draggable-rectangle {
    position: absolute !important;
    cursor: move !important;
    user-select: none !important;
    box-sizing: border-box !important;
    z-index: 10 !important;
    min-width: 50px !important;
    min-height: 50px !important;
}

/* Ensure proper selection and interaction */
.gjs-selected .draggable-rectangle,
.gjs-selected .gjs-draggable-rectangle {
    outline: 2px solid #007bff !important;
    outline-offset: 2px !important;
}

/* Resize handles for draggable rectangle */
.gjs-resizer {
    z-index: 11 !important;
}

/* Ensure the rectangle content doesn't interfere with dragging */
.draggable-rectangle > div,
.gjs-draggable-rectangle > div {
    pointer-events: none !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* Prevent text selection on the rectangle */
.draggable-rectangle,
.gjs-draggable-rectangle {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
}

/* Ensure proper layering and interaction */
.gjs-frame .draggable-rectangle,
.gjs-frame .gjs-draggable-rectangle {
    position: absolute !important;
    z-index: 10 !important;
    pointer-events: auto !important;
}

/* Anchor signature styles */
.anchor-signature {
    display: inline-block !important;
    padding: 8px 16px !important;
    border: 2px dashed #007bff !important;
    border-radius: 6px !important;
    background: rgba(0, 123, 255, 0.1) !important;
    font-size: 14px !important;
    color: #007bff !important;
    min-width: 120px !important;
    min-height: 40px !important;
    text-align: center !important;
    vertical-align: middle !important;
    cursor: pointer !important;
    user-select: none !important;
    position: relative !important;
    z-index: 5 !important;
}

.anchor-signature:hover {
    background: rgba(0, 123, 255, 0.2) !important;
    border-color: #0056b3 !important;
}

.gjs-selected .anchor-signature {
    outline: 2px solid #007bff !important;
    outline-offset: 2px !important;
}

/* Ensure the rectangle doesn't interfere with other draggable elements */
.gjs-frame .draggable-rectangle:hover,
.gjs-frame .gjs-draggable-rectangle:hover {
    z-index: 11 !important;
}

/* Ensure proper selection state */
.gjs-selected .draggable-rectangle,
.gjs-selected .gjs-draggable-rectangle {
    z-index: 12 !important;
}

/* Ensure resize handles are above the rectangle */
.gjs-resizer {
    z-index: 13 !important;
}

/* Prevent interference with other components */
.draggable-rectangle *,
.gjs-draggable-rectangle * {
    pointer-events: none !important;
}

/* Allow the rectangle itself to be interactive */
.draggable-rectangle,
.gjs-draggable-rectangle {
    pointer-events: auto !important;
    cursor: move !important;
}

/* Ensure the rectangle is above all other elements when dragging */
.draggable-rectangle.dragging,
.gjs-draggable-rectangle.dragging {
    z-index: 9999 !important;
    pointer-events: auto !important;
}
`;

import pluginBlocks from "grapesjs-blocks-basic";
import pluginExport from "grapesjs-plugin-export";
import pluginParserPostcss from "grapesjs-parser-postcss";

import pluginTuiImageEditor from "grapesjs-tui-image-editor";
import pluginStyleBg from "grapesjs-style-bg";
import pluginPresetWebpage from "grapesjs-preset-webpage";

// Load FontAwesome for icons - using CDN since font-awesome package might not be available

interface GrapeJSEditorProps {
  initialHtml: string;
  onSave: (html: string, projectData: string) => void;
  onCancel: () => void;
  blueprintName: string;
  initialProjectData?: any; // GrapeJS project data object
}

declare global {
  interface Window {
    grapesjs: any;
  }
}

export function GrapeJSEditor({ initialHtml, onSave, onCancel, blueprintName, initialProjectData }: GrapeJSEditorProps) {
  
  const [t] = useTranslation();
  const colors = useColorScheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialized = useRef(false);
  
  // Monaco editor state
  const [showMonacoEditor, setShowMonacoEditor] = useState(false);
  const [monacoHtml, setMonacoHtml] = useState('');
  const [monacoCss, setMonacoCss] = useState('');
  const [monacoHtmlEditor, setMonacoHtmlEditor] = useState<any>(null);
  const [monacoCssEditor, setMonacoCssEditor] = useState<any>(null);

  
  useEffect(() => {
    // Clean up any existing editor first
    if ((window as any).grapesEditor) {
      (window as any).grapesEditor.destroy();
      (window as any).grapesEditor = null;
    }

    // Reset initialization flag
    isInitialized.current = false;

    // Inject custom icon styles
    const styleElement = document.createElement('style');
    styleElement.textContent = iconStyles;
    document.head.appendChild(styleElement);

    try { console.log('[GrapeJS] GrapeJSEditor mounted - preparing to initialize editor'); } catch {}


    const initializeEditor = () => {
      try { console.log('[GrapeJS] initializeEditor()'); } catch {}
      if (!editorRef.current) {
        try { console.warn('[GrapeJS] initializeEditor: editorRef.current missing'); } catch {}
        return;
      }

      // Check if the container is properly mounted
      if (!editorRef.current.parentNode) {
        try { console.warn('[GrapeJS] initializeEditor: editorRef has no parentNode yet'); } catch {}
        return;
      }

      // Prevent multiple initializations
      if ((window as any).grapesEditor) {
        try { console.log('[GrapeJS] initializeEditor: grapesEditor already exists, skipping editor init'); } catch {}
        return;
      }
    try {
        const editor = grapesjs.init({
          container: editorRef.current,
          height: "100%",
          width: "100%",
          storageManager: false, // Disable storage manager to avoid conflicts
          fromElement: false, // Set to false to avoid initialization issues
          showOffsets: true,
          assetManager: {
            embedAsBase64: true,
          },
          selectorManager: { componentFirst: true },
          canvas: {
            styles: [],
            scripts: []
          },
        styleManager: {
          sectors: [{
              name: 'General',
              properties:[
                {
                  extend: 'float',
                  type: 'radio',
                  default: 'none',
                  options: [
                    { id: 'none', value: 'none', className: 'fas fa-times'},
                    { id: 'left', value: 'left', className: 'fas fa-align-left'},
                    { id: 'right', value: 'right', className: 'fas fa-align-right'}
                  ],
                },
                'display',
                { extend: 'position', type: 'select' },
                'top',
                'right',
                'left',
                'bottom',
              ],
            }, {
                name: 'Dimension',
                open: false,
                properties: [
                  'width',
                  {
                    id: 'flex-width',
                    type: 'integer',
                    name: 'Width',
                    units: ['px', '%'],
                    property: 'flex-basis',
                    toRequire: true,
                  },
                  'height',
                  'max-width',
                  'min-height',
                  'margin',
                  'padding'
                ],
              },{
                name: 'Typography',
                open: false,
                properties: [
                    'font-family',
                    'font-size',
                    'font-weight',
                    'letter-spacing',
                    'color',
                    'line-height',
                    {
                      extend: 'text-align',
                      options: [
                        { id : 'left',  label : 'Left',    className: 'fas fa-align-left'},
                        { id : 'center',  label : 'Center',  className: 'fas fa-align-center' },
                        { id : 'right',   label : 'Right',   className: 'fas fa-align-right'},
                        { id : 'justify', label : 'Justify',   className: 'fas fa-align-justify'}
                      ],
                    },
                    {
                      property: 'text-decoration',
                      type: 'radio',
                      default: 'none',
                      options: [
                        { id: 'none', label: 'None', className: 'fas fa-times'},
                        { id: 'underline', label: 'underline', className: 'fas fa-underline' },
                        { id: 'line-through', label: 'Line-through', className: 'fas fa-strikethrough'}
                      ],
                    },
                    'text-shadow'
                ],
              },{
                name: 'Decorations',
                open: false,
                properties: [
                  'opacity',
                  'border-radius',
                  'border',
                  'box-shadow',
                  'background', // { id: 'background-bg', property: 'background', type: 'bg' }
                ],
              },{
                name: 'Extra',
                open: false,
                buildProps: [
                  'transition',
                  'perspective',
                  'transform'
                ],
              },{
                name: 'Flex',
                open: false,
                properties: [{
                  name: 'Flex Container',
                  property: 'display',
                  type: 'select',
                  defaults: 'block',
                  list: [
                    { id: 'block', value: 'block', name: 'Disable'},
                    { id: 'flex', value: 'flex', name: 'Enable'}
                  ],
                },{
                  name: 'Flex Parent',
                  property: 'label-parent-flex',
                  type: 'integer',
                },{
                  name: 'Direction',
                  property: 'flex-direction',
                  type: 'radio',
                  defaults: 'row',
                  list: [{
                    id: 'row',
                    value: 'row',
                    name: 'Row',
                    className: 'icons-flex icon-dir-row',
                    title: 'Row',
                  },{
                    id: 'row-reverse',
                    value: 'row-reverse',
                    name: 'Row reverse',
                    className: 'icons-flex icon-dir-row-rev',
                    title: 'Row reverse',
                  },{
                    id: 'column',
                    value: 'column',
                    name: 'Column',
                    title: 'Column',
                    className: 'icons-flex icon-dir-col',
                  },{
                    id: 'column-reverse',
                    value: 'column-reverse',
                    name: 'Column reverse',
                    title: 'Column reverse',
                    className: 'icons-flex icon-dir-col-rev',
                  }],
                },{
                  name: 'Justify',
                  property: 'justify-content',
                  type: 'radio',
                  defaults: 'flex-start',
                  list: [{
                    id: 'flex-start',
                    value: 'flex-start',
                    className: 'icons-flex icon-just-start',
                    title: 'Start',
                  },{
                    id: 'flex-end',
                    value: 'flex-end',
                    title: 'End',
                    className: 'icons-flex icon-just-end',
                  },{
                    id: 'space-between',
                    value: 'space-between',
                    title: 'Space between',
                    className: 'icons-flex icon-just-sp-bet',
                  },{
                    id: 'space-around',
                    value: 'space-around',
                    title: 'Space around',
                    className: 'icons-flex icon-just-sp-ar',
                  },{
                    id: 'center',
                    value: 'center',
                    title: 'Center',
                    className: 'icons-flex icon-just-sp-cent',
                  }],
                },{
                  name: 'Align',
                  property: 'align-items',
                  type: 'radio',
                  defaults: 'center',
                  list: [{
                    id: 'flex-start',                    
                    value: 'flex-start',
                    title: 'Start',
                    className: 'icons-flex icon-al-start',
                  },{
                    id: 'flex-end',
                    value: 'flex-end',
                    title: 'End',
                    className: 'icons-flex icon-al-end',
                  },{
                    id: 'stretch',
                    value: 'stretch',
                    title: 'Stretch',
                    className: 'icons-flex icon-al-str',
                  },{
                    id: 'center',
                    value: 'center',
                    title: 'Center',
                    className: 'icons-flex icon-al-center',
                  }],
                },{
                  name: 'Flex Children',
                  property: 'label-parent-flex',
                  type: 'integer',
                },{
                  name: 'Order',
                  property: 'order',
                  type: 'integer',
                  defaults: '0',
                  min: 0
                },{
                  name: 'Flex',
                  property: 'flex',
                  type: 'composite',
                  properties  : [{
                  name: 'Grow',
                  property: 'flex-grow',
                  type: 'integer',
                  defaults: '0',
                  min: 0
                  },{
                    name: 'Shrink',
                    property: 'flex-shrink',
                    type: 'integer',
                    defaults: '0',
                    min: 0
                  },{
                    name: 'Basis',
                    property: 'flex-basis',
                    type: 'integer',
                    units: ['px','%',''],
                    unit: '',
                    defaults: 'auto',
                  }],
                },{
                  name: 'Align',
                  property: 'align-self',
                  type: 'radio',
                  defaults: 'auto',
                  list: [{
                    id: 'auto',
                    value: 'auto',
                    name: 'Auto',
                  },{
                    id: 'flex-start',
                    value: 'flex-start',
                    title: 'Start',
                    className: 'icons-flex icon-al-start',
                  },{
                    id: 'flex-end',
                    value   : 'flex-end',
                    title: 'End',
                    className: 'icons-flex icon-al-end',
                  },{
                    id: 'stretch',
                    value   : 'stretch',
                    title: 'Stretch',
                    className: 'icons-flex icon-al-str',
                  },{
                    id: 'center',
                    value   : 'center',
                    title: 'Center',
                    className: 'icons-flex icon-al-center',
                  }],
                }]
              }
            ],
        },
        plugins: [
          pluginBlocks,
          pluginExport,
          pluginParserPostcss,
          pluginTuiImageEditor,
          pluginStyleBg,
          pluginPresetWebpage,
        ],
        pluginsOpts: {
          [pluginBlocks as unknown as string]: { flexGrid: true },
          [pluginTuiImageEditor as unknown as string]: {
            script: [
              // 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.6.7/fabric.min.js',
              'https://uicdn.toast.com/tui.code-snippet/v1.5.2/tui-code-snippet.min.js',
              'https://uicdn.toast.com/tui-color-picker/v2.2.7/tui-color-picker.min.js',
              'https://uicdn.toast.com/tui-image-editor/v3.15.2/tui-image-editor.min.js'
            ],
            style: [
              'https://uicdn.toast.com/tui-color-picker/v2.2.7/tui-color-picker.min.css',
              'https://uicdn.toast.com/tui-image-editor/v3.15.2/tui-image-editor.min.css',
            ],
          },
       
          [pluginPresetWebpage as unknown as string]: {
            showStylesOnChange: 0,
            modalImportTitle: 'Import Template',
            modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
            modalImportContent: function(editor: any) {
              return editor.getHtml() + '<style>'+editor.getCss()+'</style>'
            },
          },
          
        },
      });

      try { console.log('[pagedjs] GrapesJS initialized'); } catch {}

      editor.I18n.addMessages({
        en: {
          styleManager: {
            properties: {
              'background-repeat': 'Repeat',
              'background-position': 'Position',
              'background-attachment': 'Attachment',
              'background-size': 'Size',
            }
          },
        }
      });

      const pn = editor.Panels;
      const modal = editor.Modal;
      const cmdm = editor.Commands;

      // Update canvas-clear command
      cmdm.add('canvas-clear', function() {
        if(confirm('Are you sure to clean the canvas?')) {
          editor.runCommand('core:canvas-clear')
          setTimeout(function(){ localStorage.clear()}, 0)
        }
      });

      // Add info command
      const mdlClass = 'gjs-mdl-dialog-sm';
      const infoContainer = document.getElementById('info-panel');

      cmdm.add('open-info', function() {
        const mdlDialog = document.querySelector('.gjs-mdl-dialog');
        if (mdlDialog) mdlDialog.className += ' ' + mdlClass;
        if (infoContainer) infoContainer.style.display = 'block';
        modal.setTitle('About this demo');
        if (infoContainer) modal.setContent(infoContainer);
        modal.open();
        modal.getModel().once('change:open', function() {
        if (mdlDialog) mdlDialog.className = mdlDialog.className.replace(mdlClass, '');
        })
      });

      // Add command to force absolute positioning for draggable rectangles
      cmdm.add('force-absolute-positioning', function() {
        const selected = editor.getSelected();
        if (selected && selected.get('type') === 'draggable-rectangle') {
          // Force absolute positioning mode by updating style
          const currentStyle = selected.getStyle();
          selected.setStyle({
            ...currentStyle,
            position: 'absolute'
          });
          
          // Force the view to update
          const view = selected.getView();
          if (view && view.el) {
            view.el.style.position = 'absolute';
            view.el.style.cursor = 'move';
          }
        }
      });

      // Add command to enable dragging for draggable rectangles
      cmdm.add('enable-dragging', function() {
        const selected = editor.getSelected();
        if (selected && selected.get('type') === 'draggable-rectangle') {
          // Force the view to be draggable
          const view = selected.getView();
          if (view && view.el) {
            view.el.setAttribute('draggable', 'true');
            view.el.style.cursor = 'move';
            view.el.style.position = 'absolute';
          }
        }
      });

      // Simple component selection handler
      editor.on('component:selected', function(component) {
        if (component.get('type') === 'draggable-rectangle') {
          component.set('position', 'absolute');
          component.set('draggable', true);
        }
      });

      pn.addButton('options', {
        id: 'open-info',
        className: 'fas fa-question-circle',
        command: function() { editor.runCommand('open-info') },
        attributes: {
          'title': 'About',
          'data-tooltip-pos': 'bottom',
        },
      });

      // Step 1: Add Pages button to the Views toolbar (no behavior yet)
      // if (!pn.getButton('views', 'open-pages')) {
      //   pn.addButton('views', {
      //     id: 'open-pages',
      //     className: 'fas fa-copy',
      //     command: 'open-pages-panel',
      //     attributes: {
      //       title: 'Pages',
      //       'data-tooltip-pos': 'bottom',
      //     },
      //     togglable: false,
      //   });
      // }

      if (!pn.getButton('views', 'open-pages')) {
        pn.addButton('views', {
          id: 'open-pages',
          className: 'fas fa-copy',
          command: 'open-pages-panel',
          attributes: { title: 'Pages' },
        });
      }

      // Step 2: Add a simple placeholder panel and toggle it with the Pages button
      const viewsPanel = pn.getPanel('views-container');
      let viewsEl: HTMLElement | null = null;
      const containerEl = (editor.getContainer && (editor.getContainer() as HTMLElement)) || null;
      const candidates: Array<HTMLElement | null> = [];
      if (viewsPanel && (viewsPanel as any).get) {
        const maybeEl = (viewsPanel as any).get('el');
        if (maybeEl && typeof maybeEl !== 'string') {
          candidates.push(maybeEl as HTMLElement);
        }
      }
      if (containerEl) {
        candidates.push(
          containerEl.querySelector('.gjs-pn-views-container') as HTMLElement,
          containerEl.querySelector('.gjs-pn-views') as HTMLElement,
          containerEl.querySelector('.gjs-pn-panel.gjs-pn-views-container') as HTMLElement,
        );
      }
      if ((editor as any).StyleManager && (editor as any).StyleManager.getContainer) {
        const smEl = (editor as any).StyleManager.getContainer();
        if (smEl && smEl.parentElement) {
          candidates.push(smEl.parentElement as HTMLElement);
        }
      }
      for (const el of candidates) {
        if (el && el instanceof HTMLElement) {
          viewsEl = el;
          break;
        }
      }

      const pagesPanel = document.createElement('div');
      pagesPanel.style.display = 'none';
      pagesPanel.style.padding = '0';
      pagesPanel.setAttribute('data-panel', 'pages');
      pagesPanel.className = 'gjs-pn-panelx';
      pagesPanel.style.background = '#ffff';
      pagesPanel.style.border = 'none';
      pagesPanel.style.borderRadius = '0';
      pagesPanel.style.marginTop = '0';
      pagesPanel.style.marginLeft = '0';
      pagesPanel.style.alignSelf = '';
      pagesPanel.style.width = '100%';
      pagesPanel.style.boxSizing = 'border-box';
      // pagesPanel.innerHTML = '<div style="font-size:12px;color:#111827;font-weight:600;margin:8px 8px 6px 8px;text-align:left">Pages</div>';
      // if (viewsEl) {
      //   viewsEl.appendChild(pagesPanel);
      // }

      // Hard-align the Pages panel to the left within the views sidebar
     
      // ensurePagesPanelGlobalStyles();

      // --------- paged.js integration helpers ---------
      const debounce = (fn: Function, wait = 150) => {
        let t: any;
        return (...args: any[]) => {
          clearTimeout(t);
          t = setTimeout(() => fn(...args), wait);
        };
      };



      // A4 frame styles removed to fix drag/drop issues

      // Simple custom pages store fallback for vanilla GrapesJS
      const customPages: { data: Record<string, { html: string; css: string }>; activeId: string; order: string[] } = {
        data: {},
        activeId: '',
        order: []
      };
      (editor as any).__customPagesStore = customPages;
      const getPagesApi = () => (editor as any).Pages;
      const ensureDefaultCustomPage = () => {
        if (!customPages.activeId && Object.keys(customPages.data).length === 0) {
          customPages.data['page-1'] = { html: String(editor.getHtml()), css: String(editor.getCss()) };
          customPages.activeId = 'page-1';
          customPages.order = ['page-1'];
        }
      };
      const setActivePage = (pageOrId: any) => {
        const api = getPagesApi();
        // Use GrapesJS Pages API if available
        if (api) {
          if (typeof api.setActive === 'function') return api.setActive(pageOrId);
          if (typeof api.select === 'function') return api.select(pageOrId);
        }
        // Fallback to custom pages: save current then load target
        ensureDefaultCustomPage();
        if (customPages.activeId) {
          customPages.data[customPages.activeId] = { html: String(editor.getHtml()), css: String(editor.getCss()) };
        }
        const targetId: string = typeof pageOrId === 'string'
          ? pageOrId
          : ((pageOrId && (pageOrId.id as string))
            || ((pageOrId && typeof pageOrId.getId === 'function' && (pageOrId.getId() as string)) || ''));
        if (!targetId) return;
        customPages.activeId = targetId;
        const target = customPages.data[targetId];
        if (target) {
          editor.setComponents(target.html || '');
          editor.setStyle(target.css || '');
          editor.refresh();
        }
      };
      const getActivePage = () => {
        const api = getPagesApi();
        if (api) {
          if (typeof api.getActive === 'function') return api.getActive();
          if (typeof api.getSelected === 'function') return api.getSelected();
        }
        // Fallback
        ensureDefaultCustomPage();
        return { getId: () => customPages.activeId } as any;
      };

      // Helper to render the current pages list with active selection
      const renderPagesList = () => {
        // Clear previous content except header
      pagesPanel.innerHTML = '<div style="font-size:12px;color:#111827;font-weight:600;margin-bottom:6px">Pages</div>';
        const pagesApi = getPagesApi();
        // Ensure at least one page exists
        if (pagesApi && pagesApi.getAll && pagesApi.getAll().length === 0) {
          const first = pagesApi.add({ id: 'page-1' });
          setActivePage(first);
        }
        if (!pagesApi) {
          ensureDefaultCustomPage();
        }
        const listWrap = document.createElement('div');
        listWrap.style.display = 'flex';
        listWrap.style.flexDirection = 'column';
        listWrap.style.gap = '6px';
        listWrap.style.padding = '0 8px 8px 8px';
        listWrap.style.margin = '0';
        listWrap.style.textAlign = 'left';

        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.justifyContent = 'space-between';
        controls.style.alignItems = 'center';
        controls.style.margin = '0 8px 8px 8px';
        const hint = document.createElement('div');
        hint.style.fontSize = '10px';
        hint.style.color = '#6b7280';
        hint.style.textAlign = 'left';
        hint.textContent = 'Canvas ready for editing';

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.textContent = 'Add Page';
        addBtn.className = 'gjs-btn-prim';
        addBtn.style.padding = '4px 8px';
        addBtn.style.borderRadius = '4px';
        addBtn.addEventListener('click', () => {
          const base = 'page-';
          let existingIds: Set<string>;
          let nextIndex: number;
          if (pagesApi && pagesApi.getAll) {
            nextIndex = (pagesApi.getAll() || []).length + 1;
            existingIds = new Set((pagesApi.getAll() || []).map((p: any) => p.getId()));
          } else {
            existingIds = new Set(Object.keys(customPages.data));
            nextIndex = existingIds.size + 1;
          }
          let newId = base + nextIndex;
          while (existingIds.has(newId)) {
            nextIndex += 1;
            newId = base + nextIndex;
          }
          if (pagesApi && pagesApi.add) {
            const newPage = pagesApi.add({ id: newId });
            setActivePage(newPage);
          } else {
            // Save current page content before switching
            ensureDefaultCustomPage();
            if (customPages.activeId) {
              customPages.data[customPages.activeId] = { html: String(editor.getHtml()), css: String(editor.getCss()) };
            }
            customPages.data[newId] = { html: '', css: '' };
            customPages.activeId = newId;
            editor.setComponents('');
            editor.setStyle('');
            editor.refresh();
          }
          renderPagesList();
        });
        controls.appendChild(hint);
        controls.appendChild(addBtn);
        pagesPanel.appendChild(controls);

        let all: any[] = [];
        if (pagesApi && pagesApi.getAll) {
          all = pagesApi.getAll();
        } else {
          // Ensure order list is kept in sync with data
          customPages.order = customPages.order.filter((id) => customPages.data[id]);
          Object.keys(customPages.data).forEach((id) => {
            if (!customPages.order.includes(id)) customPages.order.push(id);
          });
          all = customPages.order.map((id) => ({ getId: () => id }));
        }
        const active = getActivePage();

        if (!all || all.length === 0) {
          const empty = document.createElement('div');
          empty.textContent = 'No pages yet';
          empty.style.fontSize = '12px';
          empty.style.color = '#6b7280';
          listWrap.appendChild(empty);
          pagesPanel.appendChild(listWrap);
          return;
        }

        all.forEach((pg: any, index: number) => {
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.alignItems = 'center';
          row.style.justifyContent = 'space-between';
          row.style.border = '1px solid #e5e7eb';
          row.style.padding = '6px 8px';
          row.style.borderRadius = '6px';
          row.style.fontSize = '12px';
          row.style.color = '#111827';
          row.style.background = '#ffffff';

          const left = document.createElement('button');
          left.type = 'button';
          left.style.display = 'flex';
          left.style.alignItems = 'center';
          left.style.gap = '8px';
          left.style.background = 'transparent';
          left.style.border = 'none';
          left.style.padding = '0';
          left.style.cursor = 'pointer';

          const label = document.createElement('span');
          label.textContent = ((pg.getId && (pg.getId() as string)) || 'page');
          const status = document.createElement('span');
          const activeId = (active && typeof active.getId === 'function') ? (active.getId() as string) : (customPages.activeId || '');
          const rowId = (pg.getId && (pg.getId() as string)) || '';
          status.textContent = activeId === rowId ? 'Active' : '';
          status.style.color = '#059669';
          status.style.fontWeight = '600';
          status.style.fontSize = '11px';

          left.appendChild(label);
          left.appendChild(status);
          left.addEventListener('click', () => {
            setActivePage(pg);
            renderPagesList();
          });

          const right = document.createElement('div');
          right.style.display = 'flex';
          right.style.gap = '6px';

          if (!pagesApi || !pagesApi.getAll) {
            const upBtn = document.createElement('button');
            upBtn.type = 'button';
            upBtn.textContent = '↑';
            upBtn.className = 'gjs-btn';
            upBtn.style.padding = '2px 6px';
            upBtn.disabled = index === 0;
            upBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const idx = customPages.order.indexOf(rowId);
              if (idx > 0) {
                const tmp = customPages.order[idx - 1];
                customPages.order[idx - 1] = customPages.order[idx];
                customPages.order[idx] = tmp;
                renderPagesList();
              }
            });

            const downBtn = document.createElement('button');
            downBtn.type = 'button';
            downBtn.textContent = '↓';
            downBtn.className = 'gjs-btn';
            downBtn.style.padding = '2px 6px';
            downBtn.disabled = index === all.length - 1;
            downBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const idx = customPages.order.indexOf(rowId);
              if (idx > -1 && idx < customPages.order.length - 1) {
                const tmp = customPages.order[idx + 1];
                customPages.order[idx + 1] = customPages.order[idx];
                customPages.order[idx] = tmp;
                renderPagesList();
              }
            });

            right.appendChild(upBtn);
            right.appendChild(downBtn);
          }

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.textContent = 'Delete';
          delBtn.className = 'gjs-btn';
          delBtn.style.padding = '2px 6px';
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!pagesApi) {
              const wasActive = customPages.activeId === rowId;
              delete customPages.data[rowId];
              customPages.order = customPages.order.filter((id) => id !== rowId);
              if (customPages.order.length === 0) {
                customPages.data['page-1'] = { html: '', css: '' };
                customPages.order = ['page-1'];
                customPages.activeId = 'page-1';
                editor.setComponents('');
                editor.setStyle('');
              } else if (wasActive) {
                // Select first page explicitly after deletion
                const firstId = customPages.order[0];
                setActivePage(firstId);
              }
              renderPagesList();
            } else {
              const removeFn = (pagesApi as any).remove || (pagesApi as any).delete || (pagesApi as any).removePage;
              if (typeof removeFn === 'function') {
                try { removeFn.call(pagesApi, pg); } catch {}
                renderPagesList();
              } else {
                alert('Remove not supported in this GrapesJS build.');
              }
            }
          });

          right.appendChild(delBtn);

          row.appendChild(left);
          row.appendChild(right);
          listWrap.appendChild(row);
        });

        pagesPanel.appendChild(listWrap);
      };

      // Command to toggle the simple placeholder panel
      if (!cmdm.has('open-pages-panel')) {
        cmdm.add('open-pages-panel', {
          run() {
            if (!pagesPanel.parentElement && viewsEl) {
              viewsEl.appendChild(pagesPanel);
      
              // Sidebar container
              const v = viewsEl as HTMLElement;
              v.style.display = 'flex';
              v.style.flexDirection = 'column';
              v.style.alignItems = 'stretch';
              v.style.justifyContent = 'flex-start';
              v.style.padding = '0';
              v.style.margin = '0';
            }
      
            renderPagesList();
      
            // Pages panel itself
            pagesPanel.style.display = 'flex';
            pagesPanel.style.flexDirection = 'column';
            pagesPanel.style.alignItems = 'flex-start';
            pagesPanel.style.justifyContent = 'flex-start';
            pagesPanel.style.width = '100%';
            pagesPanel.style.margin = '0';
            pagesPanel.style.padding = '0';
            pagesPanel.style.textAlign = 'left';
      
            // Force all children to align left
            Array.from(pagesPanel.children).forEach(child => {
              const el = child as HTMLElement;
              el.style.margin = '0';
              el.style.padding = '0';
              el.style.textAlign = 'left';
              el.style.width = '100%';
            });
      
            pagesPanel.style.display = '';
          },
          stop() {
            pagesPanel.style.display = 'none';
          }
        });
      }
      

      // Ensure attachment after editor is fully loaded
      editor.on('load', () => {
        // Re-resolve container on load in case structure changed
        if (!pagesPanel.parentElement) {
          let target = viewsEl;
          if (!target && containerEl) {
            target = (containerEl.querySelector('.gjs-pn-views-container') as HTMLElement)
              || (containerEl.querySelector('.gjs-pn-views') as HTMLElement)
              || (containerEl.querySelector('.gjs-pn-panel.gjs-pn-views-container') as HTMLElement)
              || null;
          }
          if (target) {
            target.appendChild(pagesPanel);
          }
        }
      });

      // Add and beautify tooltips
      [['sw-visibility', 'Show Borders'], ['preview', 'Preview'], ['fullscreen', 'Fullscreen'],
       ['export-template', 'Export'], ['undo', 'Undo'], ['redo', 'Redo'],
       ['gjs-open-import-webpage', 'Import'], ['canvas-clear', 'Clear canvas']]
      .forEach(function(item) {
        pn.getButton('options', item[0])?.set('attributes', {title: item[1], 'data-tooltip-pos': 'bottom'});
      });
      [['open-sm', 'Style Manager'], ['open-layers', 'Layers'], ['open-blocks', 'Blocks']]
      .forEach(function(item) {
        pn.getButton('views', item[0])?.set('attributes', {title: item[1], 'data-tooltip-pos': 'bottom'});
      });

        // Do stuff on load
        editor.on('load', function() {
          const $ = grapesjs.$;
        
        // Configure GrapeJS to handle absolutely positioned elements properly
        editor.on('load', function() {
          // Enable dragging for absolutely positioned elements
          const canvas = editor.Canvas;
          if (canvas) {
            // Set the canvas to handle absolute positioning
            const canvasView = canvas.getCanvasView();
            if (canvasView) {
              // Enable dragging for positioned elements
              // Note: GrapeJS should handle this automatically for absolutely positioned elements
            }
          }
        });
        
        // Add a small delay to ensure DOM is fully ready
        setTimeout(function() {
        // A4 canvas sizing removed to fix drag/drop issues

        // Store draggable rectangle metadata for later reinitialization
        let rectangleCounter = 0;

        // Simple event listener for draggable rectangles
        editor.on('component:add', function(component) {
          if (component.get('type') === 'draggable-rectangle') {

            // Generate unique ID for this rectangle (stored in HTML for persistence)
            const uniqueId = 'draggable-rect-' + (++rectangleCounter);

            // Add unique identifier directly to the HTML element for persistence
            const view = component.getView();
            if (view && view.el) {
              view.el.setAttribute('data-draggable-rect-id', uniqueId);
              view.el.setAttribute('data-draggable-rect-type', 'draggable-rectangle');
            }

            // Add unique identifier to the component
            component.set('draggableRectId', uniqueId);
            component.addAttributes({ 'data-draggable-rect-id': uniqueId });

          }
        });

        // Function to reinitialize draggable rectangles after reload using HTML data attributes
        function reinitializeDraggableRectangles() {
          if (!editor) {
            return false;
          }

          if (!editor.DomComponents) {
            return false;
          }

          // Additional check to ensure editor is fully ready
          try {
            const components = editor.DomComponents.getComponents();
            if (!components) {
              return false;
            }
          } catch (error) {
            return false;
          }

          // Find all draggable rectangles by data attribute in HTML
          const canvasFrame = editor.Canvas.getFrameEl();
          if (canvasFrame) {
            // Access the iframe's content document
            const iframeDoc = canvasFrame.contentDocument || canvasFrame.contentWindow?.document;
            if (!iframeDoc) {
              return false;
            }

            const draggableRects = iframeDoc.querySelectorAll('[data-draggable-rect-type="draggable-rectangle"]');

            draggableRects.forEach((rectElement: Element, index: number) => {
              const element = rectElement as HTMLElement;
              const draggableRectId = element.getAttribute('data-draggable-rect-id');

              // Skip if already has drag functionality
              if ((element as any).isDraggableInitialized) {
                return;
              }

              // Find the corresponding GrapeJS component
              const components = editor.DomComponents.getComponents();
              let foundComponent: any = null;

              components.forEach((comp: any) => {
                const compDraggableRectId = comp.get('draggableRectId');
                if (compDraggableRectId === draggableRectId) {
                  foundComponent = comp;
                }
              });

              if (foundComponent) {

                // Ensure proper styling
                element.style.position = 'absolute';
                element.style.cursor = 'move';
                element.style.userSelect = 'none';
                element.style.boxSizing = 'border-box';
                element.style.zIndex = '10';

                // Remove any existing event listeners
                element.removeEventListener('mousedown', (element as any).handleMouseDown);

                // Add drag functionality
                const handleMouseDown = function(this: HTMLElement, e: MouseEvent) {
                  e.preventDefault();
                  e.stopPropagation();

                  // Start dragging
                  this.style.cursor = 'grabbing';
                  this.style.zIndex = '9999';
                  this.classList.add('dragging');

                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startLeft = parseInt(this.style.left) || 0;
                  const startTop = parseInt(this.style.top) || 0;

                  const handleMouseMove = (e: MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;

                    const newLeft = startLeft + deltaX;
                    const newTop = startTop + deltaY;

                    // Update the GrapeJS component style first (this will handle children)
                    const currentStyle = foundComponent.getStyle();
                    foundComponent.setStyle({
                      ...currentStyle,
                      left: newLeft + 'px',
                      top: newTop + 'px'
                    });

                    // Force GrapeJS to update the view and all child components
                    foundComponent.trigger('change:style');
                    
                    // Also update DOM directly as backup
                    this.style.left = newLeft + 'px';
                    this.style.top = newTop + 'px';
                  };

                  const handleMouseUp = (e: MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.style.cursor = 'move';
                    this.style.zIndex = '10';
                    this.classList.remove('dragging');
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                };

                // Mark as initialized and add the event listener
                (element as any).isDraggableInitialized = true;
                (element as any).handleMouseDown = handleMouseDown.bind(element);
                element.addEventListener('mousedown', (element as any).handleMouseDown);


                // Restore position from stored data attributes if available
                const storedTop = element.getAttribute('data-top');
                const storedLeft = element.getAttribute('data-left');
                const storedWidth = element.getAttribute('data-width');
                const storedHeight = element.getAttribute('data-height');

                if (storedTop && storedLeft && storedWidth && storedHeight) {

                  // Update both DOM and GrapeJS model with stored coordinates
                  element.style.top = storedTop;
                  element.style.left = storedLeft;
                  element.style.width = storedWidth;
                  element.style.height = storedHeight;

                  // Update GrapeJS component style
                  const currentStyle = foundComponent.getStyle();
                  foundComponent.setStyle({
                    ...currentStyle,
                    top: storedTop,
                    left: storedLeft,
                    width: storedWidth,
                    height: storedHeight
                  });
                }
              }
            });
          }
        }

        // Reinitialize rectangles when canvas frame loads (document reload)
        editor.on('canvas:frame:load', function() {
          setTimeout(() => {
            reinitializeDraggableRectangles();
          }, 2000);
        });

        // Also reinitialize on editor load
        editor.on('load', function() {
          setTimeout(() => {
            reinitializeDraggableRectangles();
          }, 3000);
        });

        // Run periodically to catch any missed rectangles (with limit)
        let retryCount = 0;
        const maxRetries = 10;
        const retryInterval = setInterval(() => {
          if (retryCount >= maxRetries) {
            clearInterval(retryInterval);
            return;
          }
          retryCount++;

          const success = reinitializeDraggableRectangles();
          if (success) {
            clearInterval(retryInterval);
          }
        }, 5000);

        // Add MutationObserver to catch rectangles added later
        let observer: MutationObserver | null = null;

        editor.on('load', function() {
          setTimeout(() => {
            const canvasFrame = editor.Canvas.getFrameEl();
            if (canvasFrame && !observer) {
              observer = new MutationObserver((mutations) => {
                let shouldReinitialize = false;
                mutations.forEach((mutation) => {
                  mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                      const element = node as Element;
                      if (element.classList && element.classList.contains('draggable-rectangle')) {
                        shouldReinitialize = true;
                      }
                    }
                  });
                });
                if (shouldReinitialize) {
                  reinitializeDraggableRectangles();
                }
              });

              // Access the iframe's content document for the observer
              const iframeDoc = canvasFrame.contentDocument || canvasFrame.contentWindow?.document;
              if (iframeDoc) {
                observer.observe(iframeDoc.body, {
                  childList: true,
                  subtree: true
                });
              }
            }
          }, 1500);
        });

        // Add Monaco editor button
        pn.addButton('views', {
          attributes: {
            title: 'Monaco Code Editor'
          },
          className: 'fas fa-code',
          command: function(editor: any) {
            // Get current content
            const html = editor.getHtml();
            const css = editor.getCss();
            
            // Format the HTML and CSS separately
            // Remove any body tags and head elements from the HTML since GrapeJS expects only body content
            let cleanHtml = html;
            if (cleanHtml.includes('<body')) {
              const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
              if (bodyMatch && bodyMatch[1]) {
                cleanHtml = bodyMatch[1].trim();
              }
            }
            
            // Remove head elements (meta, title, etc.) that shouldn't be in body content
            cleanHtml = cleanHtml
              .replace(/<meta[^>]*>/gi, '')
              .replace(/<title[^>]*>.*?<\/title>/gi, '')
              .replace(/<link[^>]*>/gi, '')
              .replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/<style[^>]*>.*?<\/style>/gi, '')
              .replace(/<head[^>]*>.*?<\/head>/gi, '')
              .trim();
            
            const formattedHtml = beautify.html(cleanHtml, {
              indent_size: 2,
              indent_char: ' ',
              max_preserve_newlines: 2,
              preserve_newlines: true,
              indent_scripts: 'normal',
              end_with_newline: true,
              wrap_line_length: 120,
              indent_inner_html: true,
              indent_empty_lines: false
            });
            
            const formattedCss = beautify.css(css || '', {
              indent_size: 2,
              indent_char: ' ',
              max_preserve_newlines: 2,
              preserve_newlines: true,
              end_with_newline: true,
              wrap_line_length: 120,
              indent_empty_lines: false
            });
            
            // Set the formatted code and show Monaco editor
            setMonacoHtml(formattedHtml);
            setMonacoCss(formattedCss);
            setShowMonacoEditor(true);
          },
          togglable: false,
          id: 'monaco-editor'
        });

        // Show borders by default
        pn.getButton('options', 'sw-visibility')?.set('active', 1);

        // Show logo with the version

        // Load and show settings and style manager
        const openTmBtn = pn.getButton('views', 'open-tm');
        openTmBtn && openTmBtn.set('active', 1);
        const openSm = pn.getButton('views', 'open-sm');
        openSm && openSm.set('active', 1);

        // Remove trait view
        pn.removeButton('views', 'open-tm');
        
        // Make blocks panel the default active panel
        const openBlocksBtn = pn.getButton('views', 'open-blocks');
        if (openBlocksBtn) {
          openBlocksBtn.set('active', 1);
          // Trigger the command to open the blocks panel
          editor.runCommand('open-blocks');
        }

        // Add Settings Sector
        const traitsSector = $('<div class="gjs-sm-sector no-select">'+
          '<div class="gjs-sm-sector-title"><span class="icon-settings fas fa-cog"></span> <span class="gjs-sm-sector-label">Settings</span></div>' +
          '<div class="gjs-sm-properties" style="display: none;"></div></div>');
        const traitsProps = traitsSector.find('.gjs-sm-properties');
        
        // Check if traits container exists before appending
        const traitsContainer = $('.gjs-trt-traits');
        if (traitsContainer.length > 0) {
          traitsProps.append(traitsContainer);
        }
        $('.gjs-sm-sectors').before(traitsSector);
        traitsSector.find('.gjs-sm-sector-title').on('click', function(){
          const traitStyle = traitsProps.get(0).style;
          const hidden = traitStyle.display == 'none';
          if (hidden) {
            traitStyle.display = 'block';
          } else {
            traitStyle.display = 'none';
          }
        });

        }, 100); // Close setTimeout with 100ms delay

      });
        // Add only custom placeholder blocks - let GrapeJS handle default blocks
        const blockManager = editor.BlockManager;
        
        const domc = editor.DomComponents;

        domc.addType('draggable-rectangle', {
          model: {
            defaults: {
              tagName: 'div',
              classes: ['draggable-rectangle'],
              style: {
                position: 'absolute',
                width: '200px',
                height: '150px',
                top: '50px',
                left: '50px',
                border: '2px solid #28a745',
                background: 'rgba(40, 167, 69, 0.1)',
                cursor: 'move',
                'box-sizing': 'border-box',
                'z-index': '10',
                'min-width': '50px',
                'min-height': '50px',
                'user-select': 'none'
              },
              content: '<div style="padding: 10px; text-align: center; color: #28a745; font-weight: bold;">Drag Rectangle</div>',
              resizable: true,
              draggable: true,
              droppable: false,
            selectable: true,
            highlightable: true,
              traits: [
                { type: 'number', name: 'width', label: 'Width' },
                { type: 'number', name: 'height', label: 'Height' },
                { type: 'number', name: 'top', label: 'Top' },
                { type: 'number', name: 'left', label: 'Left' }
              ]
            }
          },
          view: {
            init() {

              // Ensure data attribute is applied
              const draggableRectId = this.model.get('draggableRectId');
              if (draggableRectId && this.el) {
                this.el.setAttribute('data-draggable-rect-id', draggableRectId);
              }

              // Add drag functionality
              this.el.addEventListener('mousedown', this.handleMouseDown.bind(this));

              // Mark as initialized to prevent double-initialization
              (this.el as any).isDraggableInitialized = true;
            },


            handleMouseDown(e: MouseEvent) {
              e.preventDefault();
              e.stopPropagation();

              const startX = e.clientX;
              const startY = e.clientY;
              const startLeft = parseInt(this.el.style.left) || 0;
              const startTop = parseInt(this.el.style.top) || 0;

              const handleMouseMove = (e: MouseEvent) => {
                e.preventDefault();
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                const newLeft = startLeft + deltaX;
                const newTop = startTop + deltaY;

                // Update the GrapeJS component style first (this will handle children)
                const component = this.model;
                const currentStyle = component.getStyle();
                component.setStyle({
                  ...currentStyle,
                  left: newLeft + 'px',
                  top: newTop + 'px'
                });

                // Force GrapeJS to update the view and all child components
                component.trigger('change:style');
                
                // Also update DOM directly as backup
                this.el.style.left = newLeft + 'px';
                this.el.style.top = newTop + 'px';
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }
          }
        });

        domc.addType('anchor-signature', {
          model: {
            defaults: {
              tagName: 'div',
              classes: ['anchor-signature'],
              style: {
                'display': 'inline-block',
                'padding': '8px 16px',
                'border': '2px dashed #007bff',
                'border-radius': '6px',
                'background': 'rgba(0, 123, 255, 0.1)',
                'font-size': '14px',
                'color': '#007bff',
                'min-width': '120px',
                'min-height': '40px',
                'text-align': 'center',
                'vertical-align': 'middle',
                'cursor': 'pointer',
                'user-select': 'none'
              },
              content: '<div style="text-align: center; color: #007bff; font-size: 12px; font-weight: bold; padding: 5px;">[Anchor Signature]</div>',
              resizable: true,
              draggable: true,
              droppable: false,
              selectable: true,
              highlightable: true,
              traits: [
                { type: 'text', name: 'anchor-id', label: 'Anchor ID' },
                { type: 'text', name: 'placeholder-text', label: 'Placeholder Text' }
              ]
            }
          },
          view: {
            init() {
              // Add click handler for anchor binding
              this.el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Anchor signature clicked:', this.model.get('anchor-id'));
                // You can add anchor binding logic here
              });
            }
          }
        });

        // Register page break component type
        domc.addType('page-break', {
          model: {
            defaults: {
              tagName: 'div',
              classes: ['page-break'],
              style: {
                width: '100%',
                height: '20px',
                'page-break-before': 'always',
                'break-before': 'page',
                background: 'linear-gradient(90deg, #ff6b35 0%, #ff6b35 50%, transparent 50%, transparent 100%)',
                'background-size': '20px 2px',
                'border-top': '2px dashed #ff6b35',
                'border-bottom': '2px dashed #ff6b35',
                'margin-top': '10px',
                'margin-bottom': '10px',
                'box-sizing': 'border-box',
                'position': 'relative'
              },
              content: '<div style="text-align: center; color: #ff6b35; font-size: 12px; font-weight: bold; padding: 5px;">PAGE BREAK</div>',
              resizable: false,
              draggable: false,
              droppable: false,
              selectable: true,
              highlightable: true,
              traits: []
            }
          },
          view: {
            init() {
              // Ensure page break CSS is applied
              if (this.el) {
                this.el.style.pageBreakBefore = 'always';
                this.el.style.breakBefore = 'page';
              }
            }
          }
        });

        // Register signature placeholder component type
        domc.addType('signature-placeholder', {
          model: {
            defaults: {
              tagName: 'div',
              classes: ['signature-placeholder'],
              style: {
                border: '2px dashed #007bff',
                padding: '10px',
                'text-align': 'center',
                background: '#f8f9fa',
                color: '#007bff',
                'font-weight': 'bold',
                'min-height': '60px',
                display: 'flex !important',
                'align-items': 'center !important',
                'justify-content': 'center !important',
                width: '280px',
                height: '60px',
                cursor: 'pointer',
                fontSize: '20px'
              },
              content: '{{ signatory.signature }}',
              traits: [
                {
                  type: 'text',
                  name: 'placeholder-text',
                  label: '{{ signatory.signature }}',
                  default: '{{ signatory.signature }}'
                }
              ]
            }
          }
        });

        // Register date placeholder component type
        domc.addType('date-placeholder', {
          model: {
            defaults: {
              tagName: 'div',
              classes: ['date-placeholder'],
              style: {
                border: '2px dashed #28a745',
                padding: '10px',
                'text-align': 'center',
                background: '#f8f9fa',
                color: '#28a745',
                'font-weight': 'bold',
                'min-height': '40px',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                width: '250px',
                height: '40px',
                cursor: 'pointer'
              },
              content: '{{ signatory.date }}',
              traits: [
                {
                  type: 'text',
                  name: 'placeholder-text',
                  label: '{{ signatory.date }}',
                  default: '{{ signatory.date }}'
                }
              ]
            }
          }
        });

        // Register page break component type
        domc.addType('page-break', {
          model: {
            defaults: {
              tagName: 'div',
              classes: ['page-break', 'gjs-page-break'],
              style: {
                width: '100%',
                height: '20px',
                margin: '20px 0',
                padding: '0',
                border: '2px dashed #dc3545',
                background: '#fff5f5',
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                position: 'relative',
                'box-sizing': 'border-box'
              },
              content: '<div style="background: #dc3545; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">PAGE BREAK</div>',
              traits: [
                {
                  type: 'checkbox',
                  name: 'page-break-before',
                  label: 'Page Break Before',
                  default: true
                }
              ]
            }
          }
        });

        if(!blockManager.get('anchor-signature-placeholder')){
          blockManager.add('anchor-signature-placeholder', {
            label: 'Anchor Signature',
            // content: '<span class="signature-placeholder">[Sign Here]</span>',
            category: 'Signatory Placeholders',
            content: {
              type: 'anchor-signature'
            },
            attributes: {
              'data-block': 'anchor-signature'
            }
          });
          
        }

        // Check if blocks already exist to prevent duplicates
        if (!blockManager.get('signature-placeholder')) {
          // Add signature placeholder block
          blockManager.add('signature-placeholder', {
            label: '<div class="gjs-block-label"><i class="fas fa-signature gjs-block__media"></i><div class="gjs-block-label">Signature</div></div>',
            content: {
              type: 'signature-placeholder'
            },
            category: 'Signatory Placeholders',
            attributes: {
              'data-block': 'signature-placeholder'
            }
          });

          // Add date placeholder block
          blockManager.add('date-placeholder', {
            label: '<div class="gjs-block-label"><i class="fas fa-calendar gjs-block__media"></i><div class="gjs-block-label">Date</div></div>',
            content: {
              type: 'date-placeholder'
            },
            category: 'Signatory Placeholders',
            attributes: {
              'data-block': 'date-placeholder'
            }
          });

          // Add page break block
          blockManager.add('page-break', {
            label: '<div class="gjs-block-label"><i class="fas fa-file-alt gjs-block__media"></i><div class="gjs-block-label">Page Break</div></div>',
            content: {
              type: 'page-break'
            },
            category: 'Layout',
            attributes: {
              'data-block': 'page-break'
            }
          });

          // Add draggable rectangle block
          blockManager.add('draggable-rectangle', {
            label: '<div class="gjs-block-label"><i class="fas fa-square gjs-block__media"></i><div class="gjs-block-label">Draggable Rectangle</div></div>',
            content: {
              type: 'draggable-rectangle'
            },
            category: 'Layout',
            attributes: {
              'data-block': 'draggable-rectangle'
            }
          });





        }

        // Initial HTML content will be set by the separate useEffect


        // Real-time two-way binding for Monaco editor
        editor.on('component:update', function() {
          if (showMonacoEditor && monacoHtmlEditor && monacoCssEditor) {
            const html = editor.getHtml();
            const css = editor.getCss();
            
            // Clean the HTML to remove any body tags and head elements
            let cleanHtml = html;
            if (cleanHtml.includes('<body')) {
              const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
              if (bodyMatch && bodyMatch[1]) {
                cleanHtml = bodyMatch[1].trim();
              }
            }
            
            // Remove head elements (meta, title, etc.) that shouldn't be in body content
            cleanHtml = cleanHtml
              .replace(/<meta[^>]*>/gi, '')
              .replace(/<title[^>]*>.*?<\/title>/gi, '')
              .replace(/<link[^>]*>/gi, '')
              .replace(/<script[^>]*>.*?<\/script>/gi, '')
              .replace(/<style[^>]*>.*?<\/style>/gi, '')
              .replace(/<head[^>]*>.*?<\/head>/gi, '')
              .trim();
            
            const formattedHtml = beautify.html(cleanHtml, {
              indent_size: 2,
              indent_char: ' ',
              max_preserve_newlines: 2,
              preserve_newlines: true,
            //   break_chained_methods: false,
              indent_scripts: 'normal',
            //   brace_style: 'collapse',
            //   space_before_conditional: true,
            //   unescape_strings: false,
            //   jslint_happy: false,
              end_with_newline: true,
              wrap_line_length: 120,
              indent_inner_html: true,
            //   comma_first: false,
            //   e4x: false,
              indent_empty_lines: false
            });
            
            const formattedCss = beautify.css(css || '', {
              indent_size: 2,
              indent_char: ' ',
              max_preserve_newlines: 2,
              preserve_newlines: true,
            //   break_chained_methods: false,
            //   brace_style: 'collapse',
            //   space_before_conditional: true,
            //   unescape_strings: false,
            //   jslint_happy: false,
              end_with_newline: true,
              wrap_line_length: 120,
            //   comma_first: false,
            //   e4x: false,
              indent_empty_lines: false
            });
            
            setMonacoHtml(formattedHtml);
            setMonacoCss(formattedCss);
            monacoHtmlEditor.setValue(formattedHtml);
            monacoCssEditor.setValue(formattedCss);
          }
        });



        // Mark editor as ready
        setIsEditorReady(true);

        // Store editor reference for cleanup
        (window as any).grapesEditor = editor;


        // Load project data if provided
        if (initialProjectData) {
          try {
            editor.loadProjectData(initialProjectData);
          } catch (error) {
            // Silent error handling
          }
        }
      } catch (error) {
        // If canvas error, try to reinitialize after a delay
        if (error instanceof Error && error.message.includes('getFrames')) {
          setTimeout(() => {
            try {
              if ((window as any).grapesEditor) {
                (window as any).grapesEditor.destroy();
                (window as any).grapesEditor = null;
              }
              initializeEditor();
            } catch (retryError) {
              // Silent retry failure
            }
          }, 1000);
        }
      }
    };

    const startInitWatchdog = () => {
      try {
        if (isInitialized.current) {
          console.log('[pagedjs] init watchdog: already initialized, skipping');
          return;
        }
        let tries = 0;
        const maxTries = 40; // ~10s at 250ms
        const id = setInterval(() => {
          tries++;
          const el = editorRef.current as HTMLElement | null;
          const ready = !!(el && el.isConnected && el.parentNode);
          if (ready) {
            clearInterval(id);
            console.log('[pagedjs] init watchdog: editorRef ready, initializing');
            initializeEditor();
            return;
          }
          if (tries % 8 === 0) {
            console.log(`[pagedjs] init watchdog: waiting for editorRef (${tries}/${maxTries})`);
          }
          if (tries >= maxTries) {
            clearInterval(id);
            console.warn('[pagedjs] init watchdog: max tries reached without editorRef');
          }
        }, 250);
      } catch (e) {
        console.warn('[pagedjs] startInitWatchdog error', e);
      }
    };


    // Wait for the canvas ref to mount before initializing
    startInitWatchdog();
    
    // Cleanup function
    return () => {
      if ((window as any).grapesEditor) {
        (window as any).grapesEditor.destroy();
        (window as any).grapesEditor = null;
      }
    };
  }, []); // Empty dependency array to run only once

  // Separate useEffect to handle initialHtml updates
  useEffect(() => {
    if (initialHtml && (window as any).grapesEditor && isEditorReady) {
      try {
        (window as any).grapesEditor.setComponents(initialHtml);
      } catch (error) {
        // Silent error handling
      }
    }
  }, [initialHtml, isEditorReady]);

  // Separate useEffect to handle initialProjectData updates
  useEffect(() => {
    if (initialProjectData && (window as any).grapesEditor && isEditorReady) {
      try {
        (window as any).grapesEditor.loadProjectData(initialProjectData);
      } catch (error) {
        // Silent error handling
      }
    }
  }, [initialProjectData, isEditorReady]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if ((window as any).grapesEditor) {
        (window as any).grapesEditor.destroy();
        (window as any).grapesEditor = null;
      }
    };
  }, []);

  const handleSave = async () => {
    if (!isEditorReady || !(window as any).grapesEditor) return;

    setIsSaving(true);
    
    try {
      const editor = (window as any).grapesEditor;
      const projectData = editor.getProjectData();

      // Build per-page HTML documents for server-side rendering
      const pagesApi = (editor as any).Pages;
      const customStore = (editor as any).__customPagesStore as
        | { data: Record<string, { html: string; css: string }>; order: string[]; activeId: string }
        | undefined;

      const buildDoc = (html: string, css: string) => `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css||''}</style></head><body>${html||''}</body></html>`;

      const pagesPayload: Record<string, string> = {};
      if (pagesApi && pagesApi.getAll) {
        // Iterate all pages using API
        const current = (typeof pagesApi.getActive === 'function' ? pagesApi.getActive() : (pagesApi as any).getSelected?.());
        const all = pagesApi.getAll();
        for (const pg of all) {
          // Activate each page and capture
          if (typeof (pagesApi as any).select === 'function') (pagesApi as any).select(pg);
          else if (typeof (pagesApi as any).setActive === 'function') (pagesApi as any).setActive(pg);
          const html = editor.getHtml();
          const css = editor.getCss();
          const id = pg.getId ? pg.getId() : undefined;
          if (id) pagesPayload[id] = buildDoc(String(html), String(css));
        }
        // Restore current
        if (current) {
          if (typeof (pagesApi as any).select === 'function') (pagesApi as any).select(current);
          else if (typeof (pagesApi as any).setActive === 'function') (pagesApi as any).setActive(current);
        }
      } else if (customStore) {
        // Use the custom pages store and its order
        customStore.order.forEach((id) => {
          const entry = customStore.data[id];
          pagesPayload[id] = buildDoc(entry?.html || '', entry?.css || '');
        });
      } else {
        // Single-page fallback
        pagesPayload['page-1'] = buildDoc(String(editor.getHtml()), String(editor.getCss()));
      }

      // Also keep current page as fullHtml for backward compatibility
      const fullHtml = pagesPayload[Object.keys(pagesPayload)[0]];

      await onSave(fullHtml, { ...projectData, __pages_html__: pagesPayload });
    } catch (error) {
      // Silent error handling
    } finally {
      setIsSaving(false);
    }
  };



  const handleMonacoHtmlEditorMount = (editor: any) => {
    setMonacoHtmlEditor(editor);
    
    // Add format on save and other formatting features
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  const handleMonacoCssEditorMount = (editor: any) => {
    setMonacoCssEditor(editor);
    
    // Add format on save and other formatting features
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  const handleMonacoHtmlChange = (value: string | undefined) => {
    if (value !== undefined) {
      setMonacoHtml(value);
    }
  };

  const handleMonacoCssChange = (value: string | undefined) => {
    if (value !== undefined) {
      setMonacoCss(value);
    }
  };


  const handleApplyMonacoChanges = () => {
    if (!(window as any).grapesEditor) {
      return;
    }

    try {
      const editor = (window as any).grapesEditor;
      
      // Clean the HTML to remove any body tags and head elements
      let cleanHtml = monacoHtml;
      if (cleanHtml.includes('<body')) {
        const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch && bodyMatch[1]) {
          cleanHtml = bodyMatch[1].trim();
        }
      }
      
      // Remove head elements (meta, title, etc.) that shouldn't be in body content
      cleanHtml = cleanHtml
        .replace(/<meta[^>]*>/gi, '')
        .replace(/<title[^>]*>.*?<\/title>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<head[^>]*>.*?<\/head>/gi, '')
        .trim();
      
      try {
        // Use a simpler approach - just set components and style directly
        
        // Clear the editor first
        editor.setComponents('');
        editor.setStyle('');
        
        // Wait a moment for the clear to complete
        setTimeout(() => {
          try {
            // Set the new content
            editor.setComponents(cleanHtml);
            editor.setStyle(monacoCss);
            editor.refresh();
            
            // Check what's actually in the editor after applying
            setTimeout(() => {
              const currentHtml = editor.getHtml();
              const currentCss = editor.getCss();
              
              if (currentHtml.length > 0) {
                setShowMonacoEditor(false);
              } else {
                alert('Failed to apply changes. Please try again.');
              }
            }, 100);
            
          } catch (setError) {
            alert('Error applying changes. Please try again.');
          }
        }, 100);
        
      } catch (error) {
        alert('Error applying changes. Please try again.');
      }
      
    } catch (error) {
      alert('Error applying changes. Please check the HTML/CSS format.');
    }
  };

  const handleCancelMonacoEditor = () => {
    setShowMonacoEditor(false);
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-white shadow-sm" style={{ borderColor: colors.$20 }}>
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">{blueprintName}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onCancel} type="secondary">
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isEditorReady || isSaving}
            disableWithoutIcon
          >
            {isSaving ? t('saving') : t('save_blueprint')}
          </Button>
        </div>
      </div>

      <div id="gjs" className="flex-1 flex flex-col" style={{ backgroundColor: colors.$1 }}>
        
        {/* GrapeJS Export Toolbar */}
        <div className="panel__export"></div>

        {/* Editor Container */}
        <div className="flex-1 flex overflow-hidden">

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
                {/* Canvas */}
                <div className="flex-1 relative min-w-0">
                    <div ref={editorRef} className="absolute inset-0 gjs-editor w-full h-full"></div>
                </div>
            </div>
        </div>

        {/* Monaco Editor Modal */}
        {showMonacoEditor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Code Editor</h3>
                <div className="flex space-x-2">
                    <Button onClick={handleApplyMonacoChanges} type="primary">
                    Apply Changes
                    </Button>
                    <Button onClick={handleCancelMonacoEditor} type="secondary">
                    Cancel
                    </Button>
                </div>
                </div>
                
                {/* Dual Monaco Editors */}
                <div className="flex-1 flex p-4 gap-4">
                {/* HTML Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">HTML</h4>
                    </div>
                    <div className="flex-1 border rounded">
                    <Editor
                        height="100%"
                        defaultLanguage="html"
                        value={monacoHtml}
                        onChange={handleMonacoHtmlChange}
                        onMount={handleMonacoHtmlEditorMount}
                        options={{
                        wordWrap: "on",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        contextmenu: true,
                        fixedOverflowWidgets: true,
                        showFoldingControls: 'always',
                        suggestOnTriggerCharacters: true,
                        lineDecorationsWidth: 0,
                        tabSize: 2,
                        insertSpaces: true,
                        formatOnType: true,
                        formatOnPaste: true,
                        autoIndent: 'full',
                        autoClosingBrackets: 'always',
                        //   autoClosingPairs: 'always',
                        autoClosingQuotes: 'always',
                        autoSurround: 'languageDefined',
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        scrollbar: {
                            verticalScrollbarSize: 8,
                            horizontal: 'hidden',
                        },
                        theme: 'vs-light',
                        quickSuggestions: true,
                        //   suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: 'on',
                        tabCompletion: 'on',
                        wordBasedSuggestions: 'matchingDocuments'
                        }}
                    />
                    </div>
                </div>
                
                {/* CSS Editor */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">CSS</h4>
                    </div>
                    <div className="flex-1 border rounded">
                    <Editor
                        height="100%"
                        defaultLanguage="css"
                        value={monacoCss}
                        onChange={handleMonacoCssChange}
                        onMount={handleMonacoCssEditorMount}
                        options={{
                        wordWrap: "on",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        contextmenu: true,
                        fixedOverflowWidgets: true,
                        showFoldingControls: 'always',
                        suggestOnTriggerCharacters: true,
                        lineDecorationsWidth: 0,
                        tabSize: 2,
                        insertSpaces: true,
                        formatOnType: true,
                        formatOnPaste: true,
                        autoIndent: 'full',
                        autoClosingBrackets: 'always',
                        //   autoClosingPairs: 'always',
                        autoClosingQuotes: 'always',
                        autoSurround: 'languageDefined',
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                        scrollbar: {
                            verticalScrollbarSize: 8,
                            horizontal: 'hidden',
                        },
                        theme: 'vs-light',
                        quickSuggestions: true,
                        //   suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: 'on',
                        tabCompletion: 'on',
                        wordBasedSuggestions: 'matchingDocuments'
                        }}
                    />
                    </div>
                </div>
                </div>
            </div>
            </div>
        )}
      </div>
    </div>
  );
}