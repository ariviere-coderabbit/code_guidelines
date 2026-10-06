import type { Todo } from './types'

interface TodoItemProps {
  todo: Todo
  onToggle: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={todo.completed ? 'todo completed' : 'todo'}>
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
        />
        <span>{todo.text}</span>
      </label>
      <button type="button" onClick={() => onDelete(todo)}>
        Delete
      </button>
    </li>
  )
}
