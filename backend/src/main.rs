mod paths;

use axum::Router;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::sync::Arc;
use std::env;
use tower_http::cors::{Any, CorsLayer};
use axum::http::{header, Method};

pub struct AppState {
    pub db: PgPool,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to Neon");

    let shared_state = Arc::new(AppState { db: pool });

    let cors = CorsLayer::new()
        .allow_origin(["https://7001.hyghj.eu.org".parse().unwrap()]) 
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION]);

    let app = Router::new()
        .nest("/auth", paths::auth::router())
        .layer(cors) 
        .with_state(shared_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:7000").await.unwrap();
    println!("Backend Started on http://localhost:7000");
    
    axum::serve(listener, app).await.unwrap();
}