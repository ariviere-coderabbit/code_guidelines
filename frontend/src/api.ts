import type { Todo, TodoUpdate } from './types'

const BASE_URL = '/api/todos'

async function request(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response
}

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export async function listTodos(): Promise<Todo[]> {
  const response = await request(BASE_URL)
  return response.json()
}

export async function createTodo(text: string): Promise<Todo> {
  const response = await request(BASE_URL, jsonInit('POST', { text }))
  return response.json()
}

export async function updateTodo(id: number, update: TodoUpdate): Promise<Todo> {
  const response = await request(`${BASE_URL}/${id}`, jsonInit('PATCH', update))
  return response.json()
}

export async function deleteTodo(id: number): Promise<void> {
  await request(`${BASE_URL}/${id}`, { method: 'DELETE' })
}
