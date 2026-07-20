import { useEffect, useRef } from 'react'
import { useChat } from './useChat'
import { Header } from './components/Header'
import { UploadZone } from './components/UploadZone'
import { MessageBubble } from './components/MessageBubble'
import { ChatInput } from './components/ChatInput'
import { Toasts } from './components/Toasts'
import './App.css'

function App() {
  const { docId, fileName, uploading, uploadProgress, messages, loading, toasts, inputRef, handleUpload, handleSend, handleNewChat } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="app">
      <Header fileName={fileName} uploading={uploading} uploadProgress={uploadProgress} onUpload={handleUpload} onNewChat={handleNewChat} />

      {!docId ? (
        <UploadZone onUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress} />
      ) : (
        <div className="chat-area">
          <div className="messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <p>📄 <strong>{fileName}</strong> is ready.</p>
                <p>Ask anything about its contents.</p>
              </div>
            )}
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && (
              <div className="msg msg-ai">
                <div className="msg-avatar">🤖</div>
                <div className="msg-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <ChatInput onSend={handleSend} loading={loading} inputRef={inputRef} />
        </div>
      )}

      <Toasts toasts={toasts} />
    </div>
  )
}

export default App
