
# Docker Deployment Guide

## Quick Start

1. **Clone and configure:**
   ```bash
   git clone <your-repo>
   cd odesa-holiday-postcards
   cp .env.docker .env
   ```

2. **Edit environment variables:**
   ```bash
   nano .env
   ```
   Update with your actual API keys (keep database URLs as they are for local setup).

3. **Build and run:**
   ```bash
   docker-compose up -d --build
   ```

4. **Check status:**
   ```bash
   docker-compose ps
   docker-compose logs -f app
   ```

## Database Access

- **MongoDB:** `mongodb://admin:password123@localhost:27017/odesa-holiday?authSource=admin`
- **PostgreSQL:** `postgresql://postgres:password123@localhost:5432/odesa_holiday`

## Management Commands

- **Start:** `docker-compose up -d`
- **Stop:** `docker-compose down`
- **Restart:** `docker-compose restart app`
- **View logs:** `docker-compose logs -f`
- **Rebuild:** `docker-compose down && docker-compose up -d --build`

## Database Backup

```bash
# MongoDB backup
docker exec odesa-mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/odesa-holiday?authSource=admin" --out=/data/backup

# PostgreSQL backup
docker exec odesa-postgres pg_dump -U postgres odesa_holiday > backup.sql
```

Your app will be available at `http://localhost:5000` with all data stored locally in Docker volumes.
