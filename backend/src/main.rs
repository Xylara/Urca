mod paths;
mod middleware;

use axum::{middleware::from_fn_with_state, http::{header, Method}, Router};
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::sync::Arc;
use std::{env, fs, time::{SystemTime, UNIX_EPOCH}};
use tower_http::cors::CorsLayer;
use aws_sdk_s3::{config::{Credentials, Region}, Client as S3Client};

pub struct AppState {
    pub db: PgPool,
    pub api_key: String,
    pub s3: S3Client,
    pub bucket: String,
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

    let s3_creds = Credentials::new(
        env::var("STORAGE_ACCESS_KEY").expect("ACCESS_KEY missing"),
        env::var("STORAGE_SECRET_KEY").expect("SECRET_KEY missing"),
        None, None, "env"
    );

    let s3_conf = aws_sdk_s3::Config::builder()
        .behavior_version(aws_sdk_s3::config::BehaviorVersion::latest())
        .endpoint_url(env::var("STORAGE_ENDPOINT").expect("ENDPOINT missing"))
        .region(Region::new(env::var("STORAGE_REGION").expect("REGION missing")))
        .credentials_provider(s3_creds)
        .force_path_style(true)
        .build();

    let shared_state = Arc::new(AppState { 
        db: pool,
        api_key: get_or_create_pulse_key(),
        s3: S3Client::from_conf(s3_conf),
        bucket: env::var("STORAGE_BUCKET").expect("BUCKET missing"),
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

    println!("Pulse Backend running on http://0.0.0.0:7000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:7000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}