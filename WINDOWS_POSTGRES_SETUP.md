# PostgreSQL Setup for Windows (for SzPOS)

## 1) Download & Install PostgreSQL

1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16 (or latest version)
3. Run the installer:
   - Choose installation directory (e.g., `C:\Program Files\PostgreSQL\16`)
   - Set password for `postgres` user (remember this!)
   - Port: 5432 (default)
   - Locale: `[Default locale]`
   - Check "Install Stack Builder" (optional)
4. Click Finish

## 2) Verify Installation

Open PowerShell and run:

```powershell
psql --version
psql -U postgres
```

If prompted for password, enter the one you set during installation.

## 3) Create Database & User with Proper Permissions

In `psql` prompt:

```sql
-- Create database
CREATE DATABASE szpos;

-- Create user with proper permissions
CREATE USER szpos_user WITH PASSWORD 'szpos_password';

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE szpos TO szpos_user;

-- Grant schema permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TYPES TO szpos_user;

-- Give user CREATEDB for migrations
ALTER USER szpos_user CREATEDB;

\q
```

## 4) Verify Connection

```powershell
psql -U szpos_user -d szpos -c "SELECT 1"
```

Should return: `1`

## 5) Set Up Environment Variable (Optional but recommended)

Add to your system PATH or .env:
```
DATABASE_URL=postgresql://szpos_user:szpos_password@localhost:5432/szpos
```

## 6) Run Prisma Setup

```bash
cd apps/api

# Initialize database schema
npx prisma db push

# Or use migrate (if user has CREATEDB permission)
npx prisma migrate dev --name init

# Seed initial data
npm run prisma:seed
```

## Troubleshooting

### "psql: command not found"
- PostgreSQL not in PATH
- Solution: Add `C:\Program Files\PostgreSQL\16\bin` to Windows PATH environment variable
- Then restart PowerShell/terminal

### "permission denied for schema public"
- User doesn't have sufficient permissions
- Solution: Run the SQL commands above with `postgres` user to grant permissions

### "CREATEDB permission denied"
- Solution: Run `ALTER USER szpos_user CREATEDB;` as postgres user

### Connection refused
- PostgreSQL service not running
- Solution: Start PostgreSQL service:
  ```powershell
  # In Services app: PostgreSQL Database Server
  # Or via command line:
  net start postgresql-x64-16  # Replace 16 with your version
  ```

### Can't find password when running psql
- Solution: Use `-W` flag to prompt for password:
  ```powershell
  psql -U szpos_user -d szpos -W
  ```

## Quick Reference

```powershell
# Start PostgreSQL (if not auto-starting)
net start postgresql-x64-16

# Connect as admin
psql -U postgres

# Connect as app user
psql -U szpos_user -d szpos

# List databases
\l

# Connect to database
\c szpos

# List tables
\dt

# Exit
\q
```

## Next Steps After Setup

Once PostgreSQL is running and database is created:

```bash
cd apps/api

# Push schema to database
npx prisma db push

# View database in GUI
npx prisma studio

# Seed data
npm run prisma:seed

# Start API server
npm run dev
```
