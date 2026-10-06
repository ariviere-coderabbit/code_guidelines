import type { Todo, TodoUpdate } from './types'

const BASE_URL = '/api/todos'

/** Fetch a URL with optional request settings, rejecting unsuccessful HTTP responses. */
async function request(url: string, init?: RequestInit): Promise<Response> {
  console.log('[api]', init?.method ?? 'GET', url)
  const response = await fetch(url, init)
  if (!response.ok) {
    console.log('[api] failed', response.status, url)
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response
}

/** Build request settings for the given HTTP method and JSON-serialized body. */
function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

/** Fetch and return all todos, rejecting if the request or JSON parsing fails. */
export async function listTodos(): Promise<Todo[]> {
  const response = await request(BASE_URL)
  return response.json()
}

/** Create a todo from the supplied text and return the server's saved todo. */
export async function createTodo(text: string): Promise<Todo> {
  const response = await request(BASE_URL, jsonInit('POST', { text }))
  return response.json()
}

/** Patch the given todo ID with the supplied fields and return the updated todo. */
export async function updateTodo(id: number, update: TodoUpdate): Promise<Todo> {
  const response = await request(`${BASE_URL}/${id}`, jsonInit('PATCH', update))
  return response.json()
}

/** Delete the given todo ID, resolving without a value on success. */
export async function deleteTodo(id: number): Promise<void> {
  await request(`${BASE_URL}/${id}`, { method: 'DELETE' })
}
