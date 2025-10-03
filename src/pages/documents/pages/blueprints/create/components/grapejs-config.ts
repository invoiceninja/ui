import pluginBlocks from "grapesjs-blocks-basic";
import pluginExport from "grapesjs-plugin-export";
import pluginParserPostcss from "grapesjs-parser-postcss";
import pluginTuiImageEditor from "grapesjs-tui-image-editor";
import pluginStyleBg from "grapesjs-style-bg";
import pluginPresetWebpage from "grapesjs-preset-webpage";

export const grapejsConfig = {
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
    sectors: [
      {
        name: 'Image',
        open: false,
        properties: [
          {
            name: 'Object Fit',
            property: 'object-fit',
            type: 'select',
            defaults: 'fill',
            list: [
              { id: 'fill', value: 'fill', name: 'Fill' },
              { id: 'contain', value: 'contain', name: 'Contain' },
              { id: 'cover', value: 'cover', name: 'Cover' },
              { id: 'scale-down', value: 'scale-down', name: 'Scale Down' },
              { id: 'none', value: 'none', name: 'None' }
            ]
          },
          {
            name: 'Object Position',
            property: 'object-position',
            type: 'select',
            defaults: 'center',
            list: [
              { id: 'center', value: 'center', name: 'Center' },
              { id: 'top', value: 'top', name: 'Top' },
              { id: 'bottom', value: 'bottom', name: 'Bottom' },
              { id: 'left', value: 'left', name: 'Left' },
              { id: 'right', value: 'right', name: 'Right' },
              { id: 'top left', value: 'top left', name: 'Top Left' },
              { id: 'top right', value: 'top right', name: 'Top Right' },
              { id: 'bottom left', value: 'bottom left', name: 'Bottom Left' },
              { id: 'bottom right', value: 'bottom right', name: 'Bottom Right' }
            ]
          },
          {
            name: 'Image Width',
            property: 'width',
            type: 'integer',
            units: ['px', '%', 'em', 'rem'],
            defaults: 'auto'
          },
          {
            name: 'Image Height',
            property: 'height',
            type: 'integer',
            units: ['px', '%', 'em', 'rem'],
            defaults: 'auto'
          },
          {
            name: 'Max Width',
            property: 'max-width',
            type: 'integer',
            units: ['px', '%', 'em', 'rem'],
            defaults: 'none'
          },
          {
            name: 'Max Height',
            property: 'max-height',
            type: 'integer',
            units: ['px', '%', 'em', 'rem'],
            defaults: 'none'
          },
          {
            name: 'Border Radius',
            property: 'border-radius',
            type: 'integer',
            units: ['px', '%'],
            defaults: '0'
          }
        ]
      },
      {
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
        },
        {
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
        },
        {
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
    [pluginBlocks as unknown as string]: { 
      flexGrid: true
    },
    [pluginTuiImageEditor as unknown as string]: {
      script: [
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
};
