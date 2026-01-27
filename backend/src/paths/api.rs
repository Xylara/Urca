use axum::{
    routing::get, 
    extract::State,
    Json, Router, http::StatusCode
};
use serde::Serialize;
use std::sync::Arc;
use crate::AppState;

#[derive(Serialize)]
pub struct VersionResponse {
    pub version: String,
}

#[derive(Serialize)]
pub struct UserCountResponse {
    pub total_users: i64,
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/version", get(get_version))
        .route("/users", get(get_user_count))
}

async fn get_version() -> Json<VersionResponse> {
    Json(VersionResponse {
        version: "0.0.1".to_string(),
    })
}

async fn get_user_count(
    State(state): State<Arc<AppState>>,
) -> Result<Json<UserCountResponse>, StatusCode> {
    let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&state.db)
        .await
        .map_err(|e| {
            eprintln!("Database error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(UserCountResponse {
        total_users: row.0,
    }))
}