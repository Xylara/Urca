use crate::AppState;
use axum::{extract::{Multipart, State, Path}, http::StatusCode, response::{IntoResponse, Redirect}, Json};
use aws_sdk_s3::{primitives::ByteStream, types::ObjectCannedAcl};
use std::sync::Arc;
use uuid::Uuid;

pub async fn get_user_pfp(
    Path(user_id): Path<String>,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let default = std::env::var("DEFAULT_PFP_URL").unwrap();
    let row = sqlx::query!("SELECT pfp_url FROM users WHERE username = $1 OR id::text = $1", user_id)
        .fetch_optional(&state.db)
        .await;

    match row {
        Ok(Some(record)) => {
            if let Some(url) = record.pfp_url {
                Redirect::temporary(&url).into_response()
            } else {
                Redirect::temporary(&default).into_response()
            }
        }
        _ => Redirect::temporary(&default).into_response(),
    }
}

pub async fn upload_pfp(
    Path(user_id): Path<String>,
    State(state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> Result<StatusCode, StatusCode> {
    while let Ok(Some(field)) = multipart.next_field().await {
        if field.name().as_deref() == Some("file") {
            let data = field.bytes().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            let file_key = format!("profiles/{}.png", user_id);

            state.s3.put_object()
                .bucket(&state.bucket)
                .key(&file_key)
                .body(ByteStream::from(data))
                .content_type("image/png")
                .send()
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            let cdn_endpoint = std::env::var("CDN_ENDPOINT").unwrap_or_else(|_| "http://localhost:4000".to_string());
            let new_url = format!("{}/{}", cdn_endpoint, file_key);

            sqlx::query::<sqlx::Postgres>("UPDATE users SET pfp_url = $1 WHERE id::text = $2 OR username = $2")
                .bind(new_url)
                .bind(&user_id)
                .execute(&state.db)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            return Ok(StatusCode::OK);
        }
    }
    Err(StatusCode::BAD_REQUEST)
}