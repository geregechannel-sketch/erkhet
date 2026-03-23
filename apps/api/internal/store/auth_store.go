package store

import (
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/lib/pq"
)

func (r Repository) CreateUser(fullName, email, phone, passwordHash string) (User, error) {
	const query = `
		insert into users (full_name, email, phone, password_hash)
		values ($1, $2, $3, $4)
		returning id, full_name, email, phone, role, status, preferred_language, created_at, updated_at
	`

	var user User
	err := r.DB.QueryRow(query, strings.TrimSpace(fullName), normalizeEmail(email), strings.TrimSpace(phone), passwordHash).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.Status,
		&user.PreferredLanguage,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			return User{}, ErrConflict
		}
		return User{}, err
	}
	return user, nil
}

func (r Repository) EnsureUser(fullName, email, phone, passwordHash, role string) (User, error) {
	email = normalizeEmail(email)
	if email == "" || passwordHash == "" {
		return User{}, ErrNotFound
	}
	if strings.TrimSpace(role) == "" {
		role = "customer"
	}

	const query = `
		insert into users (full_name, email, phone, password_hash, role, status, preferred_language)
		values ($1, $2, $3, $4, $5, 'active', 'mn')
		on conflict (email) do update set
			full_name = excluded.full_name,
			phone = excluded.phone,
			password_hash = excluded.password_hash,
			role = excluded.role,
			status = 'active',
			preferred_language = 'mn',
			updated_at = now()
	`
	if _, err := r.DB.Exec(query, strings.TrimSpace(fullName), email, strings.TrimSpace(phone), passwordHash, role); err != nil {
		return User{}, err
	}
	return r.GetUserByEmail(email)
}

func (r Repository) EnsureAdminUser(fullName, email, passwordHash string) error {
	_, err := r.EnsureUser(fullName, email, "", passwordHash, "super_admin")
	return err
}

func (r Repository) GetUserByEmail(email string) (User, error) {
	const query = `
		select id, full_name, email, phone, role, status, preferred_language, created_at, updated_at, password_hash
		from users
		where email = $1
	`
	var user User
	err := r.DB.QueryRow(query, normalizeEmail(email)).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.Status,
		&user.PreferredLanguage,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.PasswordHash,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, ErrNotFound
		}
		return User{}, err
	}
	return user, nil
}

func (r Repository) GetUserByID(id int64) (User, error) {
	const query = `
		select id, full_name, email, phone, role, status, preferred_language, created_at, updated_at, password_hash
		from users
		where id = $1
	`
	var user User
	err := r.DB.QueryRow(query, id).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.Status,
		&user.PreferredLanguage,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.PasswordHash,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, ErrNotFound
		}
		return User{}, err
	}
	return user, nil
}

func (r Repository) UpdateUserProfile(userID int64, fullName, phone, preferredLanguage string) (User, error) {
	const query = `
		update users
		set full_name = $2,
			phone = $3,
			preferred_language = $4,
			updated_at = now()
		where id = $1
		returning id, full_name, email, phone, role, status, preferred_language, created_at, updated_at, password_hash
	`
	var user User
	err := r.DB.QueryRow(query, userID, strings.TrimSpace(fullName), strings.TrimSpace(phone), strings.TrimSpace(preferredLanguage)).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.Status,
		&user.PreferredLanguage,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.PasswordHash,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, ErrNotFound
		}
		return User{}, err
	}
	return user, nil
}

func (r Repository) UpdateUserPassword(userID int64, passwordHash string) error {
	const query = `
		update users
		set password_hash = $2,
			updated_at = now()
		where id = $1
	`
	result, err := r.DB.Exec(query, userID, passwordHash)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrNotFound
	}
	return nil
}

func (r Repository) ListUsers(search, role, status string) ([]User, error) {
	query := `
		select id, full_name, email, phone, role, status, preferred_language, created_at, updated_at, password_hash
		from users
		where 1 = 1
	`
	args := []any{}
	if search != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(search))+"%")
		query += ` and (lower(full_name) like $` + itoa(len(args)) + ` or lower(email) like $` + itoa(len(args)) + ` or lower(phone) like $` + itoa(len(args)) + `)`
	}
	if role != "" {
		args = append(args, role)
		query += ` and role = $` + itoa(len(args))
	}
	if status != "" {
		args = append(args, status)
		query += ` and status = $` + itoa(len(args))
	}
	query += ` order by created_at desc`

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []User{}
	for rows.Next() {
		var user User
		if err := rows.Scan(
			&user.ID,
			&user.FullName,
			&user.Email,
			&user.Phone,
			&user.Role,
			&user.Status,
			&user.PreferredLanguage,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.PasswordHash,
		); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (r Repository) UpdateUserAdmin(userID int64, role, status string) (User, error) {
	const query = `
		update users
		set role = $2,
			status = $3,
			updated_at = now()
		where id = $1
		returning id, full_name, email, phone, role, status, preferred_language, created_at, updated_at, password_hash
	`
	var user User
	err := r.DB.QueryRow(query, userID, role, status).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.Status,
		&user.PreferredLanguage,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.PasswordHash,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, ErrNotFound
		}
		return User{}, err
	}
	return user, nil
}

func (r Repository) CreateSession(userID int64, tokenHash string, expiresAt time.Time) error {
	const query = `insert into sessions (user_id, token_hash, expires_at) values ($1, $2, $3)`
	_, err := r.DB.Exec(query, userID, tokenHash, expiresAt)
	return err
}

func (r Repository) GetUserBySession(tokenHash string) (User, error) {
	const query = `
		select u.id, u.full_name, u.email, u.phone, u.role, u.status, u.preferred_language, u.created_at, u.updated_at, u.password_hash
		from sessions s
		join users u on u.id = s.user_id
		where s.token_hash = $1 and s.expires_at > now()
	`
	var user User
	err := r.DB.QueryRow(query, tokenHash).Scan(
		&user.ID,
		&user.FullName,
		&user.Email,
		&user.Phone,
		&user.Role,
		&user.Status,
		&user.PreferredLanguage,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.PasswordHash,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, ErrNotFound
		}
		return User{}, err
	}
	return user, nil
}

func (r Repository) DeleteSession(tokenHash string) error {
	_, err := r.DB.Exec(`delete from sessions where token_hash = $1`, tokenHash)
	return err
}

func (r Repository) GetDashboardSummary(userID int64) (DashboardSummary, error) {
	const query = `
		select
			(select count(*) from favorite_tours where user_id = $1),
			(select count(*) from bookings where user_id = $1 and booking_status = 'pending'),
			(select count(*) from payments where user_id = $1 and status = 'pending'),
			(select count(*) from support_requests where user_id = $1 and status in ('new', 'in_review'))
	`
	var summary DashboardSummary
	if err := r.DB.QueryRow(query, userID).Scan(
		&summary.SavedTours,
		&summary.PendingBookings,
		&summary.ActivePayments,
		&summary.OpenSupport,
	); err != nil {
		return DashboardSummary{}, err
	}
	return summary, nil
}

func (r Repository) GetUserDetail(userID int64) (UserDetail, error) {
	user, err := r.GetUserByID(userID)
	if err != nil {
		return UserDetail{}, err
	}
	favorites, err := r.ListFavoriteTours(userID)
	if err != nil {
		return UserDetail{}, err
	}
	bookings, err := r.ListBookingsByUser(userID)
	if err != nil {
		return UserDetail{}, err
	}
	payments, err := r.ListPaymentsByUser(userID)
	if err != nil {
		return UserDetail{}, err
	}
	support, err := r.ListSupportRequestsByUser(userID)
	if err != nil {
		return UserDetail{}, err
	}
	return UserDetail{
		User:      user,
		Favorites: favorites,
		Bookings:  bookings,
		Payments:  payments,
		Support:   support,
	}, nil
}
