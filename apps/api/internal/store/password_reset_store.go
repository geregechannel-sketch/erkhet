package store

import (
	"database/sql"
	"errors"
	"time"
)

func (r Repository) EnsurePasswordResetSchema() error {
	const query = `
		create table if not exists password_reset_tokens (
			id bigserial primary key,
			user_id bigint not null references users(id) on delete cascade,
			token_hash text not null unique,
			expires_at timestamptz not null,
			used_at timestamptz,
			created_at timestamptz not null default now()
		);
		create index if not exists idx_password_reset_tokens_user_id on password_reset_tokens(user_id);
		create index if not exists idx_password_reset_tokens_expires_at on password_reset_tokens(expires_at);
	`
	_, err := r.DB.Exec(query)
	return err
}

func (r Repository) CreatePasswordResetToken(userID int64, tokenHash string, expiresAt time.Time) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`delete from password_reset_tokens where user_id = $1 or expires_at <= now() or used_at is not null`, userID); err != nil {
		return err
	}
	if _, err := tx.Exec(`insert into password_reset_tokens (user_id, token_hash, expires_at) values ($1, $2, $3)`, userID, tokenHash, expiresAt); err != nil {
		return err
	}
	return tx.Commit()
}

func (r Repository) ResetPasswordWithToken(tokenHash, passwordHash string) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var userID int64
	if err := tx.QueryRow(`
		select user_id
		from password_reset_tokens
		where token_hash = $1 and used_at is null and expires_at > now()
		order by created_at desc
		limit 1
		for update
	`, tokenHash).Scan(&userID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}

	if _, err := tx.Exec(`update users set password_hash = $2, updated_at = now() where id = $1`, userID, passwordHash); err != nil {
		return err
	}
	if _, err := tx.Exec(`update password_reset_tokens set used_at = now() where token_hash = $1`, tokenHash); err != nil {
		return err
	}
	if _, err := tx.Exec(`delete from sessions where user_id = $1`, userID); err != nil {
		return err
	}
	return tx.Commit()
}