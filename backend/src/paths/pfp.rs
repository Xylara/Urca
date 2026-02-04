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
    user_id: Uuid,
    State(state): State<Arc<AppState>>,
    mut multipart: Multipart,
) -> impl IntoResponse {
    while let Ok(Some(field)) = multipart.next_field().await {
        if field.name() == Some("file") {
            let data = field.bytes().await.unwrap();
            let filename = format!("{}.png", user_id);

            let res = state.s3.put_object()
                .bucket(&state.bucket)
                .key(&filename)
                .body(ByteStream::from(data))
                .acl(ObjectCannedAcl::PublicRead)
                .content_type("image/png")
                .send()
                .await;

            if res.is_ok() {
                let url = format!("https://s3.tebi.io/{}/{}", state.bucket, filename);
                sqlx::query!("UPDATE users SET pfp_url = $1 WHERE id = $2", url, user_id)
                    .execute(&state.db)
                    .await.ok();
                return StatusCode::OK.into_response();
            }
        }
    }
    StatusCode::BAD_REQUEST.into_response()
}