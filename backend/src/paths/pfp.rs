use crate::AppState;
use axum::{extract::{Path, State}, response::{IntoResponse, Redirect}};
use uuid::Uuid;
use std::{sync::Arc, env};

pub async fn get_user_pfp(
    Path(user_uuid): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    let default = env::var("DEFAULT_PFP_URL").unwrap();
    
    let row = sqlx::query!("SELECT pfp_url FROM users WHERE id = $1", user_uuid)
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