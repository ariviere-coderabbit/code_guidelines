"""Pydantic models for the Todo API."""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, RootModel, model_validator


class TodoCreate(BaseModel):
    """Request body for creating a todo."""

    model_config = ConfigDict(str_strip_whitespace=True)

    text: str = Field(min_length=1, max_length=500)
    completed: bool = False


class TodoUpdate(BaseModel):
    """Request body for updating a todo; at least one field is required."""

    model_config = ConfigDict(str_strip_whitespace=True)

    text: Optional[str] = Field(default=None, min_length=1, max_length=500)
    completed: Optional[bool] = None

    @model_validator(mode="after")
    def require_a_change(self) -> "TodoUpdate":
        """Reject updates that set neither `text` nor `completed`.

        Returns:
            The validated model.
        """
        if not self.model_fields_set:
            raise ValueError("Provide at least one of 'text' or 'completed'")
        if self.text is None and self.completed is None:
            raise ValueError("'text' and 'completed' cannot both be null")
        return self


class Todo(BaseModel):
    """A todo item as returned by the API."""

    id: int
    text: str
    completed: bool



class TodoList(RootModel[list[Todo]]):
    """A list of todos, serialized as a plain JSON array."""
