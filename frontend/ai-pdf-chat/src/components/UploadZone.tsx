import { useState, useCallback } from 'react'

interface Props {
  onUpload: (file: File) => void
  uploading: boolean
  uploadProgress: string
}

export function UploadZone({ onUpload, uploading, uploadProgress }: Props) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onUpload(file)
  }, [onUpload])

  return (
    <div className="upload-zone-wrapper">
      <div
        className={`upload-zone ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <>
            <div className="upload-zone-spinner" />
            <p className="upload-zone-text">{uploadProgress}</p>
            <p className="upload-zone-sub">This may take a moment...</p>
          </>
        ) : (
          <>
            <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className="upload-zone-text">Drop your PDF here</p>
            <p className="upload-zone-sub">or click <strong>Upload PDF</strong> in the header</p>
          </>
        )}
      </div>
    </div>
  )
}
