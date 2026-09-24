import { useEffect, useRef } from 'react';
import type { FormEvent } from 'react';

interface RichTextEditorProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Stores and emits a raw HTML string (e.g. `<p>...</p>`), matching how `description` is
 * wired on the API — not a portable JSON format such as Draft.js/TipTap content. The
 * contentEditable div's `innerHTML` is the round-trippable representation: setting it from
 * an existing HTML value and then editing preserves the markup around the edit.
 */
export default function RichTextEditor({ id, name, value, onChange }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Keep the DOM in sync when `value` changes from outside (e.g. opening the edit modal),
  // but avoid clobbering the cursor position on every keystroke by only writing when the
  // incoming value actually differs from what's currently in the DOM.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = (e: FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  const format = (command: string) => {
    document.execCommand(command);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  return (
    <div className="rich-text-editor" id={id}>
      <div className="rich-text-editor-toolbar">
        <button type="button" onClick={() => format('bold')} aria-label="Bold">B</button>
        <button type="button" onClick={() => format('italic')} aria-label="Italic">I</button>
      </div>
      <div
        ref={ref}
        className="rich-text-editor-surface"
        role="textbox"
        aria-multiline="true"
        aria-label={name}
        contentEditable
        onInput={handleInput}
      />
    </div>
  );
}
