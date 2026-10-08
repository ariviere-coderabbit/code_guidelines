import { useRef, useState } from 'react'
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
  const [isHighlighted, setIsHighlighted] = useState(false)
  const finished = useRef(false)

  /** Switch to edit mode, seeding the input with the current text. */
  function startEditing() {
    finished.current = false
    setDraft(todo.text)
    console.log('[TodoItem] start editing', todo.id)
    setEditing(true)
  }

  /** End the current edit session once; later calls (e.g. a trailing blur) are ignored. */
  function finish(): boolean {
    if (finished.current) return false
    finished.current = true
    setEditing(false)
    return true
  }

  /** Leave edit mode, sending the change only when the trimmed text is new and nonempty. */
  function commit() {
    if (!finish()) return
    const trimmed = draft.trim()
    console.log('[TodoItem] commit edit', todo.id, trimmed)
    if (trimmed && trimmed !== todo.text) onEdit(todo, trimmed)
  }

  /** Save on Enter (unless composing with an IME) and discard the draft on Escape. */
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) commit()
    else if (event.key === 'Escape') finish()
  }

  return (
    <li
      className={`${todo.completed ? 'todo completed' : 'todo'}${isHighlighted ? ' highlighted' : ''}`}
      onMouseEnter={() => setIsHighlighted(true)}
      onMouseLeave={() => setIsHighlighted(false)}
    >
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
