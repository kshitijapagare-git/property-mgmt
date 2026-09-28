import { useEffect, useRef } from 'react';
import type { DescriptionHtml } from './types';

interface RichTextEditorProps {
  value: DescriptionHtml;
  onChange: (value: DescriptionHtml) => void;
}

/**
 * A contentEditable-based rich text editor whose value/onChange contract is plain HTML — the
 * format description is stored and sent in (per clarification, persisted as-is). Loading an
 * existing HTML value in and re-emitting onChange without further edits round-trips the same
 * HTML string; there is no conversion to/from markdown or any other intermediate format.
 */
export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Keep the DOM in sync when `value` changes from outside (e.g. loading an existing Listing),
  // without clobbering the cursor position on every keystroke — only sync when the incoming
  // value actually differs from what's currently rendered.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (ref.current) {
      onChange(ref.current.innerHTML);
    }
  };

  const exec = (command: string) => {
    document.execCommand(command);
    handleInput();
  };

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <button type="button" onClick={() => exec('bold')}><strong>B</strong></button>
        <button type="button" onClick={() => exec('italic')}><em>I</em></button>
        <button type="button" onClick={() => exec('insertUnorderedList')}>• List</button>
      </div>
      <div
        ref={ref}
        className="rte-surface"
        contentEditable
        onInput={handleInput}
      />
    </div>
  );
}
