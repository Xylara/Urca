use axum::{
    routing::{delete, get, patch, post},
    extract::{Path, State},
    http::StatusCode,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;
use crate::AppState;

#[derive(Serialize, sqlx::FromRow)]
pub struct FriendEntry {
    pub user_id: Uuid,
    pub username: String,
    pub pfp_url: Option<String>,
    pub status: String,
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/friends/:user_id", get(list_friends))
        .route("/friends/:user_id/pending", get(list_pending))
        .route("/friends/request", post(send_request))
        .route("/friends/accept", patch(accept_request))
        .route("/friends/decline", patch(decline_request))
        .route("/friends/block", patch(block_user))
        .route("/friends/remove", delete(remove_friend))
}

fn ordered(a: Uuid, b: Uuid) -> (Uuid, Uuid) {
    if a < b { (a, b) } else { (b, a) }
}

pub async fn list_friends(
    Path(user_id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<FriendEntry>>, StatusCode> {
    let friends = sqlx::query_as::<_, FriendEntry>(
        r#"
        SELECT
            CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END AS user_id,
            u.username,
            u.pfp_url,
            f.status
        FROM friendships f
        JOIN users u ON u.id = CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END
        WHERE (f.user_id_1 = $1 OR f.user_id_2 = $1)
          AND f.status = 'accepted'
        ORDER BY u.username ASC
        "#,
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(friends))
}

pub async fn list_pending(
    Path(user_id): Path<Uuid>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<FriendEntry>>, StatusCode> {
    let pending = sqlx::query_as::<_, FriendEntry>(
        r#"
        SELECT
            CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END AS user_id,
            u.username,
            u.pfp_url,
            f.status
        FROM friendships f
        JOIN users u ON u.id = CASE WHEN f.user_id_1 = $1 THEN f.user_id_2 ELSE f.user_id_1 END
        WHERE f.user_id_2 = $1
          AND f.status = 'pending'
        ORDER BY f.created_at DESC
        "#,
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(pending))
}

pub async fn send_request(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<serde_json::Value>,
) -> Result<StatusCode, StatusCode> {
    let sender: Uuid = payload["sender_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let target: Uuid = payload["target_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    if sender == target {
        return Err(StatusCode::BAD_REQUEST);
    }

    let (id1, id2) = ordered(sender, target);

    let existing = sqlx::query_scalar::<_, String>(
        "SELECT status FROM friendships WHERE user_id_1 = $1 AND user_id_2 = $2",
    )
    .bind(id1)
    .bind(id2)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match existing.as_deref() {
        Some("accepted") | Some("pending") => return Err(StatusCode::CONFLICT),
        Some("blocked") => return Err(StatusCode::FORBIDDEN),
        _ => {}
    }

    sqlx::query(
        r#"
        INSERT INTO friendships (user_id_1, user_id_2, status)
        VALUES ($1, $2, 'pending')
        ON CONFLICT (user_id_1, user_id_2) DO UPDATE SET status = 'pending', updated_at = NOW()
        "#,
    )
    .bind(id1)
    .bind(id2)
    .execute(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::CREATED)
}

pub async fn accept_request(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<serde_json::Value>,
) -> Result<StatusCode, StatusCode> {
    let acceptor: Uuid = payload["acceptor_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let sender: Uuid = payload["sender_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let (id1, id2) = ordered(acceptor, sender);

    let result = sqlx::query(
        r#"
        UPDATE friendships SET status = 'accepted', updated_at = NOW()
        WHERE user_id_1 = $1 AND user_id_2 = $2 AND status = 'pending'
        "#,
    )
    .bind(id1)
    .bind(id2)
    .execute(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::OK)
}

pub async fn decline_request(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<serde_json::Value>,
) -> Result<StatusCode, StatusCode> {
    let decliner: Uuid = payload["decliner_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let sender: Uuid = payload["sender_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let (id1, id2) = ordered(decliner, sender);

    let result = sqlx::query(
        r#"
        UPDATE friendships SET status = 'declined', updated_at = NOW()
        WHERE user_id_1 = $1 AND user_id_2 = $2 AND status = 'pending'
        "#,
    )
    .bind(id1)
    .bind(id2)
    .execute(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::OK)
}

pub async fn block_user(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<serde_json::Value>,
) -> Result<StatusCode, StatusCode> {
    let blocker: Uuid = payload["blocker_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let target: Uuid = payload["target_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    if blocker == target {
        return Err(StatusCode::BAD_REQUEST);
    }

    let (id1, id2) = ordered(blocker, target);

    sqlx::query(
        r#"
        INSERT INTO friendships (user_id_1, user_id_2, status)
        VALUES ($1, $2, 'blocked')
        ON CONFLICT (user_id_1, user_id_2) DO UPDATE SET status = 'blocked', updated_at = NOW()
        "#,
    )
    .bind(id1)
    .bind(id2)
    .execute(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}

pub async fn remove_friend(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<serde_json::Value>,
) -> Result<StatusCode, StatusCode> {
    let user_a: Uuid = payload["user_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let user_b: Uuid = payload["friend_id"]
        .as_str()
        .and_then(|s| s.parse().ok())
        .ok_or(StatusCode::BAD_REQUEST)?;

    let (id1, id2) = ordered(user_a, user_b);

    let result = sqlx::query(
        "DELETE FROM friendships WHERE user_id_1 = $1 AND user_id_2 = $2",
    )
    .bind(id1)
    .bind(id2)
    .execute(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(StatusCode::OK)
}