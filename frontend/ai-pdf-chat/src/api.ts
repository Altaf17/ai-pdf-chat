const BASE = 'http://localhost:8000'

export async function uploadPDF(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/upload/`, { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Upload failed')
  return data.doc_id
}

export async function pollStatus(docId: string): Promise<string> {
  const res = await fetch(`${BASE}/upload/status/${docId}`)
  const data = await res.json()
  return data.status
}

export async function sendMessage(docId: string, question: string): Promise<string> {
  const res = await fetch(`${BASE}/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_id: docId, question }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Chat failed')
  return data.answer
}
