import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Alignment, AutoLink, Base64UploadAdapter, BlockQuote, Bold, ClassicEditor, Essentials, FontColor, FontSize, Heading, Image, ImageInsert,
  ImageResize, ImageStyle, ImageToolbar, ImageUpload, Indent, IndentBlock, Italic, Link, List, ListProperties, Paragraph, PasteFromOffice,
  RemoveFormat, Table, TableCellProperties, TableProperties, TableToolbar, Underline, Undo,
  type Editor, type EditorConfig,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { cn } from '../ui/utils';

export interface EmailRichTextEditorHandle {
  insertAtCursor: (text: string) => void;
  focus: () => void;
}

interface EmailRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  /** Called as the user types "@word": the query to filter fields by, and a function that swaps "@word" for the chosen text. Called with null when no "@word" is being typed. */
  onAtQuery?: (query: string | null, apply: (text: string) => void) => void;
}

/**
 * Give tables written by the editor the same look as the seeded ones, as inline styles, so the email
 * is self-contained wherever it is shown or sent. Tables that already carry a style are left alone.
 */
export function styleTables(html: string): string {
  if (!html.includes('<t')) return html;
  return html
    .replace(/<table(?![^>]*\bstyle=)([^>]*)>/gi, '<table$1 style="border-collapse:collapse;width:100%;">')
    .replace(/<(td|th)(?![^>]*\bstyle=)([^>]*)>/gi, '<$1$2 style="padding:6px;border:1px solid #e5e7eb;">');
}

// The same editor PRISM uses (CKEditor 5), set up with the same toolbar: paragraph styles, bold, italic, underline,
// alignment, link, bulleted and numbered lists with their style choices, font colour and size, then
// (under "⋮") indent, quote, undo, redo and image. Table is the one extra, and it sits at the end.
const TOOLBAR = [
  'heading', '|', 'bold', 'italic', 'underline', '|', 'alignment', '|', 'link', '|', 'bulletedList', 'numberedList', '|',
  'fontColor', 'fontSize', '|', 'outdent', 'indent', 'blockQuote', '|', 'undo', 'redo', '|', 'insertImage', 'insertTable', '|', 'removeFormat',
];

export const EmailRichTextEditor = forwardRef<EmailRichTextEditorHandle, EmailRichTextEditorProps>(
  ({ value, onChange, placeholder = 'Compose your email body…', className, minHeight = 280, onAtQuery }, ref) => {
    const editorRef = useRef<Editor | null>(null);

    const config = useMemo<EditorConfig>(
      () => ({
        licenseKey: 'GPL',
        plugins: [
          Essentials, Paragraph, Heading, Bold, Italic, Underline, Alignment, Link, AutoLink, List, ListProperties, FontColor, FontSize,
          Indent, IndentBlock, BlockQuote, Undo, Image, ImageInsert, ImageToolbar, ImageUpload, ImageStyle, ImageResize, Base64UploadAdapter,
          Table, TableToolbar, TableProperties, TableCellProperties, RemoveFormat, PasteFromOffice,
        ],
        toolbar: { items: TOOLBAR, shouldNotGroupWhenFull: false },
        placeholder,
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            ...[1, 2, 3, 4, 5, 6].map((n) => ({ model: `heading${n}` as const, view: `h${n}`, title: `Heading ${n}`, class: `ck-heading_heading${n}` })),
          ],
        },
        fontSize: { options: [9, 11, 13, 'default', 17, 19, 21] },
        list: { properties: { styles: true, startIndex: false, reversed: false } },
        link: { defaultProtocol: 'https://' },
        table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'] },
        image: { toolbar: ['imageStyle:inline', 'imageStyle:block', '|', 'resizeImage'] },
      }),
      // The editor is built once; the placeholder is only read at creation.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    useImperativeHandle(ref, () => ({
      insertAtCursor: (text: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.model.change((writer) => {
          editor.model.insertContent(writer.createText(text));
        });
        editor.editing.view.focus();
      },
      focus: () => {
        editorRef.current?.editing.view.focus();
      },
    }));

    // "@word" detection: the text typed just before the cursor, in the current text node.
    function watchAt(editor: Editor) {
      if (!onAtQuery) return;
      const pos = editor.model.document.selection.getFirstPosition();
      if (!pos) return onAtQuery(null, () => {});
      // Inside a run of text the cursor has a text node; at the end of one it only has the node before it.
      const inside = pos.textNode;
      const prev = pos.nodeBefore;
      const before = inside
        ? inside.data.slice(0, pos.offset - (inside.startOffset ?? 0))
        : prev && 'data' in prev ? (prev as { data: string }).data : '';
      const m = /@(\w*)$/.exec(before);
      if (!m) return onAtQuery(null, () => {});
      const startOffset = pos.offset - m[0].length;
      onAtQuery(m[1], (text) => {
        editor.model.change((writer) => {
          const start = writer.createPositionAt(pos.parent, startOffset);
          writer.remove(writer.createRange(start, pos));
          editor.model.insertContent(writer.createText(text), start);
        });
        editor.editing.view.focus();
      });
    }

    return (
      <div className={cn('email-editor overflow-hidden rounded-md border border-input', className)} style={{ ['--email-editor-min-height' as string]: `${minHeight}px` }}>
        <style>{`
          .email-editor .ck.ck-editor__editable_inline { min-height: var(--email-editor-min-height); font-size: 14px; line-height: 1.5; padding: 0 14px; }
          .email-editor .ck.ck-editor__editable_inline > :first-child { margin-top: 12px; }
          .email-editor .ck.ck-editor__editable_inline > :last-child { margin-bottom: 12px; }
          .email-editor .ck.ck-toolbar { border: 0; border-bottom: 1px solid var(--border); background: var(--card); }
          .email-editor .ck.ck-editor__main > .ck-editor__editable:not(.ck-focused) { border-color: transparent; }
          .email-editor .ck.ck-editor__main > .ck-editor__editable.ck-focused { border-color: transparent; box-shadow: none; }
          .email-editor .ck-content table { border-collapse: collapse; }
          .email-editor .ck-content td, .email-editor .ck-content th { border: 1px solid #d1d5db; padding: 6px 8px; }
          .email-editor .ck-content blockquote { border-left: 4px solid #d1d5db; margin-left: 0; padding-left: 12px; font-style: italic; }
          .ck.ck-balloon-panel, .ck.ck-dropdown__panel { z-index: 80; }
        `}</style>
        <CKEditor
          editor={ClassicEditor}
          config={config}
          data={value}
          onReady={(editor) => {
            editorRef.current = editor;
            editor.model.document.selection.on('change:range', () => watchAt(editor));
          }}
          onChange={(_e, editor) => {
            onChange(editor.getData());
            watchAt(editor);
          }}
        />
      </div>
    );
  },
);

EmailRichTextEditor.displayName = 'EmailRichTextEditor';
