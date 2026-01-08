use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use uuid::Uuid;

use crate::data::{CreateTodo, Db, Pagination, Todo, UpdateTodo};

/// GET /todos
pub async fn todos_index(pagination: Query<Pagination>, State(db): State<Db>) -> impl IntoResponse {
    let todos = db.read().unwrap();

    let todos = todos
        .values()
        .skip(pagination.offset.unwrap_or(0))
        .take(pagination.limit.unwrap_or(usize::MAX))
        .cloned()
        .collect::<Vec<_>>();

    Json(todos)
}

/// POST /todos
pub async fn todos_create(
    State(db): State<Db>,
    Json(input): Json<CreateTodo>,
) -> impl IntoResponse {
    let todo = Todo::new(input.text().to_string(), false);

    db.write().unwrap().insert(todo.id(), todo.clone());

    (StatusCode::CREATED, Json(todo))
}

/// PATCH /todos/{id}
pub async fn todos_update(
    Path(id): Path<Uuid>,
    State(db): State<Db>,
    Json(input): Json<UpdateTodo>,
) -> Result<impl IntoResponse, StatusCode> {
    let mut todo = db
        .read()
        .unwrap()
        .get(&id)
        .cloned()
        .ok_or(StatusCode::NOT_FOUND)?;

    if let Some(text) = input.text() {
        todo.set_text(text.to_string());
    }

    if let Some(completed) = input.completed() {
        todo.set_completed(completed);
    }

    db.write().unwrap().insert(todo.id(), todo.clone());

    Ok(Json(todo))
}

/// DELETE /todos/{id}
pub async fn todos_delete(Path(id): Path<Uuid>, State(db): State<Db>) -> impl IntoResponse {
    if db.write().unwrap().remove(&id).is_some() {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}
