import type { FormEvent, ReactNode } from 'react'

interface ModalProps {
  title: string
  submitLabel: string
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}

export function Modal({ title, submitLabel, onClose, onSubmit, children }: ModalProps) {
  return (
    <div className="overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={onSubmit}>
          {children}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
