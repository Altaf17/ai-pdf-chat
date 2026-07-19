import { useState } from 'react'

interface Props {
  onSend: (text: string) => void
  loading: boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}

export function ChatInput({ onSend, loading, inputRef }: Props) {
  const [value, setValue] = useState('')

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    if (!value.trim() || loading) return
    onSend(value.trim())
    setValue('')
  }

  return (
    <div className="chat-input-row">
      <div className="chat-input-wrapper">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          rows={1}
          disabled={loading}
        />
      </div>
      <button className="send-btn" onClick={submit} disabled={loading || !value.trim()}>
        {loading
          ? <span className="spinner" />
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
        }
      </button>
    </div>
  )
}
