import { useEffect, useMemo, useRef } from 'react';

interface RichTextEditorProps {
  id: string;
  name: string;
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ id, name, value, onChange }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const safeHtml = useMemo(() => value ?? '', [value]);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== safeHtml) {
      ref.current.innerHTML = safeHtml;
    }
  }, [safeHtml]);

  const emitChange = () => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  };

  return (
    <div>
      <input type="hidden" id={id} name={name} value={value} readOnly />
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        style={{ minHeight: 120, border: '1px solid #d1d5db', borderRadius: 8, padding: 12, background: '#fff' }}
      />
    </div>
  );
}
