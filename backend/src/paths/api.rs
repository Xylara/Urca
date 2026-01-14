use axum::{routing::get, Json, Router};
use serde::Serialize;
use std::sync::Arc;
use crate::AppState;

#[derive(Serialize)]
pub struct VersionResponse {
    pub version: String,
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/version", get(get_version))
}

async fn get_version() -> Json<VersionResponse> {
    Json(VersionResponse {
        version: "0.0.1".to_string(),
    })
}