import type { Todo } from './types'

interface TodoItemProps {
  todo: Todo
  disabled: boolean
  onToggle: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export function TodoItem({ todo, disabled, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={todo.completed ? 'todo completed' : 'todo'}>
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          disabled={disabled}
          onChange={() => onToggle(todo)}
        />
        <span>{todo.text}</span>
      </label>
      <button type="button" disabled={disabled} onClick={() => onDelete(todo)}>
        Delete
      </button>
    </li>
  )
}
