# PostgreSQL Setup for SzPOS (Local Database)

This project is designed to run **locally** with your own PostgreSQL instance.

## 1) Install PostgreSQL

- Ubuntu/Debian: `sudo apt install postgresql postgresql-contrib`
- macOS (Homebrew): `brew install postgresql@16`
- Windows: Use the official PostgreSQL installer.

## 2) Create local database and user

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE szpos;
CREATE USER szpos_user WITH PASSWORD 'szpos_password';
GRANT ALL PRIVILEGES ON DATABASE szpos TO szpos_user;
\q
```

## 3) Initialize schema

```bash
psql "postgresql://szpos_user:szpos_password@localhost:5432/szpos" -f apps/api/sql/schema.sql
```

## 4) Configure API connection

Create `apps/api/.env`:

```env
DATABASE_URL=postgresql://szpos_user:szpos_password@localhost:5432/szpos
PORT=4000
```

## 5) Start app

```bash
npm run dev:api
npm run dev:web
```

## Notes

- Keep PostgreSQL running before starting `dev:api`.
- Use strong passwords for production deployments.
