import { useRef } from 'react'

interface Props {
  fileName: string | null
  uploading: boolean
  uploadProgress: string
  onUpload: (file: File) => void
  onNewChat: () => void
}

export function Header({ fileName, uploading, uploadProgress, onUpload, onNewChat }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <header className="header">
      <div className="header-brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <span className="header-title">DocMind AI</span>
      </div>

      <div className="header-right">
        {fileName && !uploading && (
          <button className="new-chat-btn" onClick={onNewChat}>New Chat</button>
        )}
        {fileName && !uploading && (
          <span className="filename-badge" title={fileName}>
            📄 {fileName.length > 24 ? fileName.slice(0, 24) + '…' : fileName}
          </span>
        )}
        {uploading && <span className="upload-progress">{uploadProgress}</span>}
        <button
          className="upload-btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <><span className="spinner" /> Processing</>
          ) : fileName ? 'Change PDF' : 'Upload PDF'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          hidden
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = '' }}
        />
      </div>
    </header>
  )
}
