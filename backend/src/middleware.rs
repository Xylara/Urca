use axum::{
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
    body::Body,
};
use std::sync::Arc;
use crate::AppState;

pub async fn auth_middleware(
    State(state): State<Arc<AppState>>,
    req: Request<Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = req.headers()
        .get("x-api-key")
        .and_then(|h| h.to_str().ok());

    match auth_header {
        Some(key) if key == state.api_key => {
            Ok(next.run(req).await)
        },
        _ => {
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}