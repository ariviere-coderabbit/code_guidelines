import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { createTodo, deleteTodo, listTodos, updateTodo } from './api'
import { TodoItem } from './TodoItem'
import type { Todo } from './types'

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong'
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(new Set())

  useEffect(() => {
    let cancelled = false
    listTodos()
      .then((loaded) => {
        if (!cancelled) setTodos(loaded)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function run(action: () => Promise<void>) {
    try {
      setError(null)
      await action()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  function setPending(id: number, pending: boolean) {
    setPendingIds((current) => {
      const next = new Set(current)
      if (pending) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleAdd(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || adding) return
    setAdding(true)
    run(async () => {
      try {
        const created = await createTodo(trimmed)
        setTodos((current) => [...current, created])
        // Keep anything typed while the request was in flight.
        setText((current) => (current.trim() === trimmed ? '' : current))
      } finally {
        setAdding(false)
      }
    })
  }

  function handleToggle(todo: Todo) {
    setPending(todo.id, true)
    run(async () => {
      try {
        const updated = await updateTodo(todo.id, { completed: !todo.completed })
        setTodos((current) => current.map((t) => (t.id === updated.id ? updated : t)))
      } finally {
        setPending(todo.id, false)
      }
    })
  }

  function handleDelete(todo: Todo) {
    run(async () => {
      await deleteTodo(todo.id)
      setTodos((current) => current.filter((t) => t.id !== todo.id))
    })
  }

  return (
    <main>
      <h1>Todos</h1>
      <form onSubmit={handleAdd}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs doing?"
          maxLength={500}
          aria-label="New todo"
          disabled={loading || adding}
        />
        <button type="submit" disabled={loading || adding}>
          Add
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            disabled={pendingIds.has(todo.id)}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </main>
  )
}
