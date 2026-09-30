import { useEffect, useRef } from 'react'

export interface RichTextEditorProps {
  label: string
  value: string
  onChange: (html: string) => void
  required?: boolean
}

/** Strips HTML tags down to plain text, e.g. for the 40-character content gate. */
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent ?? ''
}

/** ContentEditable-backed control that stores/emits HTML; no length rule is enforced here. */
export function RichTextEditor({ label, value, onChange, required }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)

  // Keep the DOM in sync with external value changes (e.g. reset/edit), without
  // clobbering the cursor while the user types: typing updates `value` via onInput,
  // making this a no-op in that case.
  useEffect(() => {
    const editor = editorRef.current
    if (editor && editor.innerHTML !== value) {
      editor.innerHTML = value
    }
  }, [value])

  const plainTextLength = stripHtml(value).length

  return (
    <div>
      <label>
        {label}
        <div
          ref={editorRef}
          role="textbox"
          aria-label={label}
          aria-required={required}
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        />
      </label>
      <span>{plainTextLength} characters</span>
    </div>
  )
}
