"""FastAPI Todo app with in-memory storage."""

from threading import Lock

from fastapi import FastAPI, HTTPException, Response, status

from models import Todo, TodoCreate, TodoUpdate

app = FastAPI(title="Todo API")

_todos: dict[int, Todo] = {}
_next_id = 1
_lock = Lock()


def _get_or_404(todo_id: int) -> Todo:
    """Look up a todo by id.

    Args:
        todo_id: The id of the todo to find.

    Returns:
        The matching todo.

    Raises:
        HTTPException: 404 if no todo has that id.
    """
    todo = _todos.get(todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@app.get("/todos", response_model=list[Todo])
def list_todos() -> list[Todo]:
    """List all todos.

    Returns:
        All todos, in creation order.
    """
    with _lock:
        return list(_todos.values())


@app.post("/todos", response_model=Todo, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate) -> Todo:
    """Create a todo.

    Args:
        payload: The text and optional completed flag for the new todo.

    Returns:
        The created todo, including its assigned id.
    """
    global _next_id
    with _lock:
        todo = Todo(id=_next_id, text=payload.text, completed=payload.completed)
        _todos[todo.id] = todo
        _next_id += 1
        return todo


@app.patch("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, payload: TodoUpdate) -> Todo:
    """Edit a todo's text and/or completed flag.

    Args:
        todo_id: The id of the todo to update.
        payload: The fields to change; omitted fields are left as-is.

    Returns:
        The updated todo.
    """
    with _lock:
        todo = _get_or_404(todo_id)
        updated = todo.model_copy(update=payload.model_dump(exclude_none=True))
        _todos[todo_id] = updated
        return updated


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int) -> Response:
    """Delete a todo.

    Args:
        todo_id: The id of the todo to delete.

    Returns:
        An empty 204 response.
    """
    with _lock:
        _get_or_404(todo_id)
        del _todos[todo_id]
    return Response(status_code=status.HTTP_204_NO_CONTENT)
