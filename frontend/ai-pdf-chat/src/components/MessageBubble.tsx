import ReactMarkdown from 'react-markdown'
import type { Message } from '../useChat'

export function MessageBubble({ msg }: { msg: Message }) {
  return (
    <div className={`msg msg-${msg.role}`}>
      <div className="msg-avatar">{msg.role === 'ai' ? '🤖' : '👤'}</div>
      <div className="msg-bubble">
        {msg.role === 'ai'
          ? <ReactMarkdown>{msg.text}</ReactMarkdown>
          : <p>{msg.text}</p>
        }
      </div>
    </div>
  )
}
