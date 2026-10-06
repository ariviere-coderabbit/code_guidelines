import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { createTodo, deleteTodo, listTodos, updateTodo } from './api'
import { TodoItem } from './TodoItem'
import type { Todo } from './types'

/** Return an error's message, or a fallback for non-Error values. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong'
}

/** Render the todo list and manage loading, mutations, and error feedback. */
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
        console.log('[App] loaded todos', loaded.length)
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

  /** Clear the previous error and await an action, displaying any failure. */
  async function run(action: () => Promise<void>) {
    try {
      setError(null)
      await action()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  /** Add or remove a todo ID from the set of pending mutations. */
  function setPending(id: number, pending: boolean) {
    setPendingIds((current) => {
      const next = new Set(current)
      if (pending) next.add(id)
      else next.delete(id)
      return next
    })
  }

  /** Submit nonempty trimmed text once, preserving edits made during the request. */
  function handleAdd(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || adding) return
    setAdding(true)
    run(async () => {
      try {
        const created = await createTodo(trimmed)
        console.log('[App] created todo', created)
        setTodos((current) => [...current, created])
        // Keep anything typed while the request was in flight.
        setText((current) => (current.trim() === trimmed ? '' : current))
      } finally {
        setAdding(false)
      }
    })
  }

  /** Start an action for a todo, report failures, and clear its pending state afterward. */
  function withPending(id: number, action: () => Promise<void>) {
    setPending(id, true)
    run(async () => {
      try {
        await action()
      } finally {
        setPending(id, false)
      }
    })
  }

  /** Toggle a todo's completion on the server and store the returned todo locally. */
  function handleToggle(todo: Todo) {
    withPending(todo.id, async () => {
      const updated = await updateTodo(todo.id, { completed: !todo.completed })
      console.log('[App] toggled todo', updated)
      setTodos((current) => current.map((t) => (t.id === updated.id ? updated : t)))
    })
  }

  /** Delete a todo on the server, then remove it from the local list. */
  function handleDelete(todo: Todo) {
    withPending(todo.id, async () => {
      await deleteTodo(todo.id)
      console.log('[App] deleted todo', todo.id)
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
