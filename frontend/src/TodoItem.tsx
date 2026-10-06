import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Todo } from './types'

interface TodoItemProps {
  todo: Todo
  disabled: boolean
  onToggle: (todo: Todo) => void
  onEdit: (todo: Todo, text: string) => void
  onDelete: (todo: Todo) => void
}

/** Render a todo with toggle, inline edit and delete controls, disabling them when requested. */
export function TodoItem({ todo, disabled, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)

  /** Switch to edit mode, seeding the input with the current text. */
  function startEditing() {
    setDraft(todo.text)
    setEditing(true)
  }

  /** Leave edit mode, sending the change only when the trimmed text is new and nonempty. */
  function commit() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.text) onEdit(todo, trimmed)
  }

  /** Save on Enter and discard the draft on Escape. */
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') commit()
    else if (event.key === 'Escape') setEditing(false)
  }

  return (
    <li className={todo.completed ? 'todo completed' : 'todo'}>
      {editing ? (
        <input
          autoFocus
          value={draft}
          maxLength={500}
          aria-label="Edit todo"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
        />
      ) : (
        <label>
          <input
            type="checkbox"
            checked={todo.completed}
            disabled={disabled}
            onChange={() => onToggle(todo)}
          />
          <span onDoubleClick={disabled ? undefined : startEditing}>{todo.text}</span>
        </label>
      )}
      <div className="actions">
        <button type="button" disabled={disabled || editing} onClick={startEditing}>
          Edit
        </button>
        <button type="button" disabled={disabled} onClick={() => onDelete(todo)}>
          Delete
        </button>
      </div>
    </li>
  )
}
