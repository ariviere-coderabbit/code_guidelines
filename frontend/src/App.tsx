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

  useEffect(() => {
    let cancelled = false
    listTodos()
      .then((loaded) => {
        if (!cancelled) setTodos(loaded)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(errorMessage(e))
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

  function handleAdd(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    run(async () => {
      const created = await createTodo(trimmed)
      setTodos((current) => [...current, created])
      setText('')
    })
  }

  function handleToggle(todo: Todo) {
    run(async () => {
      const updated = await updateTodo(todo.id, { completed: !todo.completed })
      setTodos((current) => current.map((t) => (t.id === updated.id ? updated : t)))
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
        />
        <button type="submit">Add</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </main>
  )
}
