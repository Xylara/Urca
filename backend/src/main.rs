mod paths;
mod middleware;

use axum::{middleware::from_fn_with_state, http::{header, Method}, Router, routing::get};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::sync::Arc;
use std::{env, fs, time::{SystemTime, UNIX_EPOCH}};
use tower_http::cors::CorsLayer;

pub struct AppState {
    pub db: PgPool,
    pub api_key: String,
    pub http: reqwest::Client,
    pub nimbus_os_url: String,
    pub nimbus_key: String,
}

fn get_or_create_pulse_key() -> String {
    let file_path = "pulse.key";
    if let Ok(existing_key) = fs::read_to_string(file_path) {
        return existing_key.trim().to_string();
    }
    let new_key = format!("{:x}", SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos());
    fs::write(file_path, &new_key).expect("Unable to write pulse.key");
    new_key
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL missing");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to DB");

    let shared_state = Arc::new(AppState {
        db: pool,
        api_key: get_or_create_pulse_key(),
        http: reqwest::Client::new(),
        nimbus_os_url: env::var("NIMBUS_OS_URL").expect("NIMBUS_OS_URL missing"),
        nimbus_key: env::var("NIMBUS_KEY").expect("NIMBUS_KEY missing"),
    });

    let cors = CorsLayer::new()
        .allow_origin([
            "https://7001.hyghj.eu.org".parse().unwrap(),
            "http://localhost:5173".parse().unwrap(),
        ])
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::HeaderName::from_static("x-api-key"),
        ]);

    let protected = Router::new()
        .nest("/auth", paths::auth::router())
        .nest("/api", paths::api::router())
        .layer(from_fn_with_state(shared_state.clone(), middleware::auth_middleware));

    let app = Router::new()
        .route("/api/user/:user_id/pfp", get(paths::api::get_user_pfp))
        .merge(protected)
        .layer(cors)
        .with_state(shared_state);

    println!("Pulse Backend running on http://0.0.0.0:7000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:7000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}