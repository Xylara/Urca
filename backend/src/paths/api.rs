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

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub database: String,
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/version", get(get_version))
        .route("/users", get(get_user_count))
        .route("/health", get(get_health))
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
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(UserCountResponse {
        total_users: row.0,
    }))
}

async fn get_health(
    State(state): State<Arc<AppState>>,
) -> Json<HealthResponse> {
    let db_status = match sqlx::query("SELECT 1").execute(&state.db).await {
        Ok(_) => "up",
        Err(_) => "down",
    };

    Json(HealthResponse {
        status: "up".to_string(),
        database: db_status.to_string(),
    })
}