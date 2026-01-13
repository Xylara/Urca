use axum::{
    routing::post,
    extract::State,
    Json, Router, http::StatusCode,
};
use serde::{Deserialize, Serialize};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, PasswordVerifier, SaltString},
    Argon2, PasswordHash,
};
use jsonwebtoken::{encode, Header, EncodingKey};
use std::sync::Arc;
use crate::AppState; 

#[derive(Deserialize)]
pub struct AuthPayload {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
}

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

#[derive(sqlx::FromRow)]
struct UserRow {
    password_hash: String,
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}

async fn register(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthPayload>,
) -> Result<StatusCode, StatusCode> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(payload.password.as_bytes(), &salt)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .to_string();

    sqlx::query::<sqlx::Postgres>(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2)"
    )
    .bind(&payload.username)
    .bind(&password_hash)
    .execute(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Registration Error: {:?}", e);
        StatusCode::BAD_REQUEST
    })?;

    Ok(StatusCode::CREATED)
}

async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<AuthPayload>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let user = sqlx::query_as::<sqlx::Postgres, UserRow>(
        "SELECT password_hash FROM users WHERE username = $1"
    )
    .bind(&payload.username)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        eprintln!("Login Query Error: {:?}", e);
        StatusCode::UNAUTHORIZED 
    })?;

    let parsed_hash = PasswordHash::new(&user.password_hash)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "default_secret".into());
    let claims = Claims {
        sub: payload.username,
        exp: 2000000000, 
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(AuthResponse { token }))
}