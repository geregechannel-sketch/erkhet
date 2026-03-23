# Erkhet Solar Tours Live Ops Guide

## 1. Админ руу орох

1. Browser дээр [https://erkhetsolartours.mn/auth/login](https://erkhetsolartours.mn/auth/login) нээнэ.
2. Нэвтэрсний дараа [https://erkhetsolartours.mn/admin](https://erkhetsolartours.mn/admin) руу орно.
3. Одоогийн туршилтын эрхүүд:
   - Бүртгэлтэй хэрэглэгч: `user2` / `ErkhetUser2!2026`
   - Админ: `user3` / `ErkhetAdmin3!2026`
4. Хэрэв bootstrap admin ашиглах бол серверийн `.env` доторх `ADMIN_BOOTSTRAP_EMAIL` ба `ADMIN_BOOTSTRAP_PASSWORD`-оор орно.

## 2. Сайтын update-аа дахин deploy хийх

Зөв дараалал нь: `локал дээр засвар -> build шалгах -> дараа нь live руу deploy`.

### 2.1 Локал дээр шалгах

`apps/web` дотор:

```bash
npm run build
```

### 2.2 Code-оо сервер рүү хуулах

Windows PowerShell дээр:

```powershell
scp -r "C:\Users\Jamsrandorj\Documents\Codex\erkhet-site" root@202.131.1.75:/root/
```

### 2.3 Сервер дээр deploy хийх

```bash
ssh root@202.131.1.75
cd /root/erkhet-site
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml ps
```

## 3. Backup яаж авах

### 3.1 Database backup

```bash
ssh root@202.131.1.75
mkdir -p /root/backups/$(date +%F)
docker exec erkhet-site-db-1 pg_dump -U erkhet erkhet > /root/backups/$(date +%F)/erkhet.sql
```

### 3.2 Config backup

```bash
cp /root/erkhet-site/.env /root/backups/$(date +%F)/
cp /root/erkhet-site/docker-compose.prod.yml /root/backups/$(date +%F)/
cp /etc/nginx/sites-available/erkhetsolartours.mn /root/backups/$(date +%F)/
```

### 3.3 Backup-аа нэг файл болгох

```bash
tar -czf /root/backups/erkhet-backup-$(date +%F).tar.gz /root/backups/$(date +%F)
```

## 4. Сервер унтарвал яаж асаах

### 4.1 VPS өөрөө унтарсан бол

1. Datacom panel руу орно.
2. VPS SSD2 service-ээ нээнэ.
3. `Start` дарна.
4. Ассаны дараа SSH-ээр орж шалгана.

### 4.2 VPS асаалттай боловч сайт нээгдэхгүй бол

```bash
ssh root@202.131.1.75
systemctl restart nginx
cd /root/erkhet-site
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

### 4.3 Алдаа шалгах

```bash
docker compose -f docker-compose.prod.yml logs web --tail 50
docker compose -f docker-compose.prod.yml logs api --tail 50
systemctl status nginx --no-pager
```

## 5. Засварууд live сайт руу шууд ордог уу?

Үгүй. Зөв арга нь:

1. Локал код дээр засварлана.
2. `npm run build` хийж шалгана.
3. Дараа нь VPS дээр `docker compose -f docker-compose.prod.yml up --build -d` хийж live руу гаргана.

Тиймээс локал дээр зассан зүйл live сайт дээр харагдахын тулд заавал deploy хийх хэрэгтэй.
