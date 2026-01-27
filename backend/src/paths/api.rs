use axum::{
    routing::{get, patch},
    extract::{State, Json},
    Router, http::{StatusCode, HeaderMap},
};
use serde::{Deserialize, Serialize};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use std::sync::Arc;
use uuid::Uuid;
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

#[derive(Serialize, sqlx::FromRow)]
pub struct UserListItem {
    pub id: Uuid,
    pub username: String,
    pub admin: String,
}

#[derive(Deserialize)]
pub struct UpdateUserPayload {
    pub id: Uuid,
    pub new_username: Option<String>,
    pub new_password: Option<String>,
    pub admin_status: Option<String>,
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/version", get(get_version))
        .route("/users", get(get_user_count))
        .route("/health", get(get_health))
        .route("/users/list", get(list_users))
        .route("/users/update", patch(update_user))
}

fn check_auth(headers: &HeaderMap, state_key: &str) -> Result<(), StatusCode> {
    if let Some(key) = headers.get("x-api-key") {
        if key.to_str().unwrap_or("") == state_key {
            return Ok(());
        }
    }
    Err(StatusCode::UNAUTHORIZED)
}

async fn get_version() -> Json<VersionResponse> {
    Json(VersionResponse {
        version: "0.0.1".to_string(),
    })
}

async fn get_user_count(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
) -> Result<Json<UserCountResponse>, StatusCode> {
    check_auth(&headers, &state.api_key)?;
    let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&state.db)
        .await
        .map_err(|e| {
            eprintln!("Count Error: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

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

async fn list_users(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<UserListItem>>, StatusCode> {
    check_auth(&headers, &state.api_key)?;

    let users = sqlx::query_as::<_, UserListItem>(
        "SELECT id, username, admin FROM users ORDER BY username ASC"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        eprintln!("DB Error (list_users): {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(users))
}

async fn update_user(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
    Json(payload): Json<UpdateUserPayload>,
) -> Result<StatusCode, StatusCode> {
    check_auth(&headers, &state.api_key)?;

    if let Some(username) = payload.new_username {
        sqlx::query("UPDATE users SET username = $1 WHERE id = $2")
            .bind(username)
            .bind(payload.id)
            .execute(&state.db)
            .await
            .map_err(|e| {
                eprintln!("Username update error: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;
    }

    if let Some(admin_status) = payload.admin_status {
        sqlx::query("UPDATE users SET admin = $1 WHERE id = $2")
            .bind(admin_status)
            .bind(payload.id)
            .execute(&state.db)
            .await
            .map_err(|e| {
                eprintln!("Admin status update error: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;
    }

    if let Some(password) = payload.new_password {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
            .to_string();

        sqlx::query("UPDATE users SET password_hash = $1 WHERE id = $2")
            .bind(password_hash)
            .bind(payload.id)
            .execute(&state.db)
            .await
            .map_err(|e| {
                eprintln!("Password update error: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;
    }

    Ok(StatusCode::OK)
}