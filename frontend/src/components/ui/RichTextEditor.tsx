/**
 * @file RichTextEditor.tsx
 * @description Editor de texto rico (WYSIWYG) para conteúdo de aulas.
 * 
 * Utiliza Quill.js para formatação visual: títulos, negrito, listas,
 * código, tabelas e muito mais.
 * 
 * @example
 * <RichTextEditor value={conteudo} onChange={setConteudo} />
 */

import React, { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

/* ═══════════════════════════════════════════════════════════════
   Tipos
   ═══════════════════════════════════════════════════════════════ */

interface RichTextEditorProps {
  /** Conteúdo HTML atual */
  value: string;
  /** Callback quando o conteúdo muda */
  onChange: (value: string) => void;
  /** Placeholder do editor */
  placeholder?: string;
  /** Altura mínima do editor */
  minHeight?: string;
}

/* ═══════════════════════════════════════════════════════════════
   Configuração dos Módulos e Formatos
   ═══════════════════════════════════════════════════════════════ */

/**
 * Barra de ferramentas disponível no editor.
 */
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
];

/**
 * Formatos permitidos no editor.
 */
const FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'blockquote', 'code-block',
  'link', 'image',
];

/* ═══════════════════════════════════════════════════════════════
   Componente
   ═══════════════════════════════════════════════════════════════ */

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escreva o conteúdo da aula aqui...',
  minHeight = '300px',
}) => {
  /**
   * Módulos do Quill (memorizados para evitar recriação).
   */
  const modules = useMemo(
    () => ({
      toolbar: TOOLBAR_OPTIONS,
    }),
    []
  );

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
        style={{ minHeight }}
      />
    </div>
  );
};

export default RichTextEditor;