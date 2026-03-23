# Tech Stack Migration: Next.js + Go + PostgreSQL

Энэ төсөл одоо 3 хэсэгтэй болсон.

- `apps/web`: Next.js frontend
- `apps/api`: Go REST API
- `db`: PostgreSQL schema (`init.sql`)

## Official data preserved

Дараах хуучин албан ёсны өгөгдлийг хадгалсан:
- Company: `Erkhet Solar Tours LLC / Эрхэт Солар Турс ХХК`
- Phone: `+976 95633513`
- Email: `info@erkhtsolartours.mn`
- Facebook: `https://www.facebook.com/share/1bzQfpFhu3/`
- Payment methods: `QPay (MN)`, `Visa/Mastercard (Stripe)`
- Assets: `logo.jpg`, `telegram-qr.jpg`, `wechat-qr.jpg`

## Run with Docker Compose

```bash
docker compose up --build
```

- Web: `http://localhost:3000`
- API: `http://localhost:8080/api/health`
- PostgreSQL: `localhost:5432`

## Run locally without Docker

### 1) PostgreSQL

Create DB and run schema:

```bash
psql -U erkhet -d erkhet -f db/init.sql
```

### 2) API

```bash
cd apps/api
go mod tidy
go run ./cmd/server
```

### 3) Web

```bash
cd apps/web
npm install
npm run dev
```

## API endpoints

- `GET /api/health`
- `GET /api/company`
- `GET /api/tours`
- `GET /api/destinations`
- `POST /api/inquiries`

`POST /api/inquiries` payload:

```json
{
  "name": "User",
  "phone": "+976...",
  "email": "user@example.com",
  "interested_tour": "Говийн аялал",
  "people_count": 2,
  "days_count": 5,
  "note": "..."
}
```
