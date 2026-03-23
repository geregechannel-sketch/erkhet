package store

import (
	"errors"
	"strings"

	"github.com/lib/pq"
)

func (r Repository) ListTours(filter TourFilter, includeAll bool) ([]Tour, error) {
	query := `
		select
			id,
			slug,
			title,
			summary,
			description,
			business_line,
			operation_type,
			tour_kind,
			duration_days,
			duration_nights,
			base_price,
			currency,
			pricing_note,
			route,
			cover_image,
			status,
			featured,
			capacity,
			availability_count,
			departure_dates,
			itinerary,
			inclusions,
			exclusions,
			sort_order,
			created_at,
			updated_at
		from tours
		where 1 = 1
	`
	args := []any{}
	if !includeAll {
		query += ` and status = 'published'`
	} else if filter.Status != "" {
		args = append(args, filter.Status)
		query += ` and status = $` + itoa(len(args))
	}
	if filter.Search != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Search))+"%")
		query += ` and (lower(title) like $` + itoa(len(args)) + ` or lower(summary) like $` + itoa(len(args)) + ` or lower(route) like $` + itoa(len(args)) + `)`
	}
	if filter.BusinessLine != "" {
		args = append(args, filter.BusinessLine)
		query += ` and business_line = $` + itoa(len(args))
	}
	if filter.OperationType != "" {
		args = append(args, filter.OperationType)
		query += ` and operation_type = $` + itoa(len(args))
	}
	if filter.TourKind != "" {
		args = append(args, filter.TourKind)
		query += ` and tour_kind = $` + itoa(len(args))
	}
	query += ` order by featured desc, sort_order asc, created_at desc`

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tours := []Tour{}
	for rows.Next() {
		tour, err := scanTour(rows)
		if err != nil {
			return nil, err
		}
		tours = append(tours, tour)
	}
	return tours, rows.Err()
}

func (r Repository) GetTourBySlug(slug string, includeHidden bool) (Tour, error) {
	query := `
		select
			id,
			slug,
			title,
			summary,
			description,
			business_line,
			operation_type,
			tour_kind,
			duration_days,
			duration_nights,
			base_price,
			currency,
			pricing_note,
			route,
			cover_image,
			status,
			featured,
			capacity,
			availability_count,
			departure_dates,
			itinerary,
			inclusions,
			exclusions,
			sort_order,
			created_at,
			updated_at
		from tours
		where slug = $1
	`
	if !includeHidden {
		query += ` and status = 'published'`
	}
	return scanTour(r.DB.QueryRow(query, slug))
}

func (r Repository) GetTourByID(id int64) (Tour, error) {
	query := `
		select
			id,
			slug,
			title,
			summary,
			description,
			business_line,
			operation_type,
			tour_kind,
			duration_days,
			duration_nights,
			base_price,
			currency,
			pricing_note,
			route,
			cover_image,
			status,
			featured,
			capacity,
			availability_count,
			departure_dates,
			itinerary,
			inclusions,
			exclusions,
			sort_order,
			created_at,
			updated_at
		from tours
		where id = $1
	`
	return scanTour(r.DB.QueryRow(query, id))
}

func (r Repository) CreateTour(tour Tour) (Tour, error) {
	const query = `
		insert into tours (
			slug,
			title,
			summary,
			description,
			business_line,
			operation_type,
			tour_kind,
			duration_days,
			duration_nights,
			base_price,
			currency,
			pricing_note,
			route,
			cover_image,
			status,
			featured,
			capacity,
			availability_count,
			departure_dates,
			itinerary,
			inclusions,
			exclusions,
			sort_order
		)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, nullif($11, ''), $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
		returning
			id,
			slug,
			title,
			summary,
			description,
			business_line,
			operation_type,
			tour_kind,
			duration_days,
			duration_nights,
			base_price,
			currency,
			pricing_note,
			route,
			cover_image,
			status,
			featured,
			capacity,
			availability_count,
			departure_dates,
			itinerary,
			inclusions,
			exclusions,
			sort_order,
			created_at,
			updated_at
	`
	price := any(nil)
	if tour.PriceAmount != nil {
		price = *tour.PriceAmount
	}
	created, err := scanTour(r.DB.QueryRow(
		query,
		tour.Slug,
		strings.TrimSpace(tour.Title),
		strings.TrimSpace(tour.Summary),
		strings.TrimSpace(tour.Description),
		tour.BusinessLine,
		tour.OperationType,
		tour.TourKind,
		tour.DurationDays,
		tour.DurationNights,
		price,
		tour.Currency,
		strings.TrimSpace(tour.PricingNote),
		strings.TrimSpace(tour.Route),
		strings.TrimSpace(tour.CoverImage),
		tour.Status,
		tour.Featured,
		tour.Capacity,
		tour.AvailabilityCount,
		pq.Array(tour.DepartureDates),
		pq.Array(tour.Itinerary),
		pq.Array(tour.Inclusions),
		pq.Array(tour.Exclusions),
		tour.SortOrder,
	))
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			return Tour{}, ErrConflict
		}
		return Tour{}, err
	}
	return created, nil
}

func (r Repository) UpdateTour(id int64, tour Tour) (Tour, error) {
	const query = `
		update tours
		set slug = $2,
			title = $3,
			summary = $4,
			description = $5,
			business_line = $6,
			operation_type = $7,
			tour_kind = $8,
			duration_days = $9,
			duration_nights = $10,
			base_price = $11,
			currency = nullif($12, ''),
			pricing_note = $13,
			route = $14,
			cover_image = $15,
			status = $16,
			featured = $17,
			capacity = $18,
			availability_count = $19,
			departure_dates = $20,
			itinerary = $21,
			inclusions = $22,
			exclusions = $23,
			sort_order = $24,
			updated_at = now()
		where id = $1
		returning
			id,
			slug,
			title,
			summary,
			description,
			business_line,
			operation_type,
			tour_kind,
			duration_days,
			duration_nights,
			base_price,
			currency,
			pricing_note,
			route,
			cover_image,
			status,
			featured,
			capacity,
			availability_count,
			departure_dates,
			itinerary,
			inclusions,
			exclusions,
			sort_order,
			created_at,
			updated_at
	`
	price := any(nil)
	if tour.PriceAmount != nil {
		price = *tour.PriceAmount
	}
	updated, err := scanTour(r.DB.QueryRow(
		query,
		id,
		tour.Slug,
		strings.TrimSpace(tour.Title),
		strings.TrimSpace(tour.Summary),
		strings.TrimSpace(tour.Description),
		tour.BusinessLine,
		tour.OperationType,
		tour.TourKind,
		tour.DurationDays,
		tour.DurationNights,
		price,
		tour.Currency,
		strings.TrimSpace(tour.PricingNote),
		strings.TrimSpace(tour.Route),
		strings.TrimSpace(tour.CoverImage),
		tour.Status,
		tour.Featured,
		tour.Capacity,
		tour.AvailabilityCount,
		pq.Array(tour.DepartureDates),
		pq.Array(tour.Itinerary),
		pq.Array(tour.Inclusions),
		pq.Array(tour.Exclusions),
		tour.SortOrder,
	))
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			return Tour{}, ErrConflict
		}
		return Tour{}, err
	}
	return updated, nil
}

func (r Repository) DeleteTour(id int64) error {
	var bookingCount int
	if err := r.DB.QueryRow(`select count(*) from bookings where tour_id = $1`, id).Scan(&bookingCount); err != nil {
		return err
	}
	if bookingCount > 0 {
		return ErrConflict
	}
	result, err := r.DB.Exec(`delete from tours where id = $1`, id)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (r Repository) SaveFavorite(userID int64, slug string) error {
	const query = `
		insert into favorite_tours (user_id, tour_id)
		select $1, id from tours where slug = $2 and status = 'published'
		on conflict do nothing
	`
	result, err := r.DB.Exec(query, userID, slug)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		if _, err := r.GetTourBySlug(slug, false); err != nil {
			return err
		}
	}
	return nil
}

func (r Repository) RemoveFavorite(userID int64, slug string) error {
	const query = `
		delete from favorite_tours
		where user_id = $1 and tour_id = (select id from tours where slug = $2)
	`
	_, err := r.DB.Exec(query, userID, slug)
	return err
}

func (r Repository) ListFavoriteTours(userID int64) ([]Tour, error) {
	const query = `
		select
			t.id,
			t.slug,
			t.title,
			t.summary,
			t.description,
			t.business_line,
			t.operation_type,
			t.tour_kind,
			t.duration_days,
			t.duration_nights,
			t.base_price,
			t.currency,
			t.pricing_note,
			t.route,
			t.cover_image,
			t.status,
			t.featured,
			t.capacity,
			t.availability_count,
			t.departure_dates,
			t.itinerary,
			t.inclusions,
			t.exclusions,
			t.sort_order,
			t.created_at,
			t.updated_at
		from favorite_tours f
		join tours t on t.id = f.tour_id
		where f.user_id = $1
		order by f.created_at desc
	`
	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	favorites := []Tour{}
	for rows.Next() {
		tour, err := scanTour(rows)
		if err != nil {
			return nil, err
		}
		tour.Saved = true
		favorites = append(favorites, tour)
	}
	return favorites, rows.Err()
}
