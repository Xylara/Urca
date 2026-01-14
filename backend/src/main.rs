mod paths;
mod middleware;

use axum::{
    middleware::from_fn_with_state,
    http::{header, Method},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::sync::Arc;
use std::{env, fs};
use tower_http::cors::CorsLayer;

pub struct AppState {
    pub db: PgPool,
    pub api_key: String,
}

fn get_or_create_pulse_key() -> String {
    let file_path = "pulse.key";
    
    if let Ok(existing_key) = fs::read_to_string(file_path) {
        return existing_key.trim().to_string();
    }

    let new_key = format!("{:x}", SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos());
    
    fs::write(file_path, &new_key).expect("Unable to write pulse.key");
    println!("First time Launching pulse?");
    println!("Heres your API key {}", new_key);
    println!("Thanks for using Pulse!");
    
    new_key
}

use std::time::{SystemTime, UNIX_EPOCH};

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to Database");

    let api_key = get_or_create_pulse_key();
    let shared_state = Arc::new(AppState { 
        db: pool,
        api_key 
    });

    let cors = CorsLayer::new()
        .allow_origin(["https://7001.hyghj.eu.org".parse().unwrap()]) 
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE])
        .allow_headers([
            header::CONTENT_TYPE, 
            header::AUTHORIZATION, 
            header::HeaderName::from_static("x-api-key")
        ]);

    let app = Router::new()
        .nest("/auth", paths::auth::router())
        .nest("/api", paths::api::router())
        .layer(from_fn_with_state(shared_state.clone(), middleware::auth_middleware))
        .layer(cors) 
        .with_state(shared_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:7000").await.unwrap();
    println!("Backend Started on http://localhost:7000");
    
    axum::serve(listener, app).await.unwrap();
}