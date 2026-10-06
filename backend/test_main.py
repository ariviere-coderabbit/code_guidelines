"""Tests for the Todo API."""

import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture(autouse=True)
def reset_state() -> None:
    """Clear in-memory storage before each test."""
    main._todos.clear()
    main._next_id = 1


client = TestClient(main.app)


def test_create_and_list() -> None:
    """Created todos appear in the list with defaults applied."""
    res = client.post("/todos", json={"text": "  milk "})
    assert res.status_code == 201
    assert res.json() == {"id": 1, "text": "milk", "completed": False}
    assert client.get("/todos").json() == [res.json()]


@pytest.mark.parametrize("body", [{}, {"text": ""}, {"text": "   "}])
def test_create_rejects_invalid(body: dict) -> None:
    """Missing or blank text is rejected."""
    assert client.post("/todos", json=body).status_code == 422


def test_patch_toggle_and_edit() -> None:
    """PATCH updates only the provided fields."""
    client.post("/todos", json={"text": "a"})
    res = client.patch("/todos/1", json={"completed": True})
    assert res.json() == {"id": 1, "text": "a", "completed": True}
    res = client.patch("/todos/1", json={"text": "b"})
    assert res.json() == {"id": 1, "text": "b", "completed": True}


@pytest.mark.parametrize("body", [{}, {"text": None}, {"text": ""}])
def test_patch_rejects_invalid(body: dict) -> None:
    """Empty or null-only PATCH bodies are rejected."""
    client.post("/todos", json={"text": "a"})
    assert client.patch("/todos/1", json=body).status_code == 422


def test_delete_and_404() -> None:
    """Deleting removes the todo; unknown ids return 404."""
    client.post("/todos", json={"text": "a"})
    assert client.delete("/todos/1").status_code == 204
    assert client.get("/todos").json() == []
    assert client.delete("/todos/1").status_code == 404
    assert client.patch("/todos/1", json={"completed": True}).status_code == 404
