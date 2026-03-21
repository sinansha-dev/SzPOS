# SzPOS Complete Database Setup Guide

## Overview
This guide walks you through setting up PostgreSQL locally and connecting it to your SzPOS application using pgAdmin.

## Prerequisites
- PostgreSQL installed and running
- pgAdmin installed and running
- Node.js and npm installed
- SzPOS project cloned

## Architecture
```
PostgreSQL (Database Server)
    ↓
pgAdmin (Web Interface)
    ↓
Prisma (ORM)
    ↓
SzPOS API (Node.js/Express)
    ↓
SzPOS Web (React/Vite)
```

---

## Phase 1: PostgreSQL & pgAdmin Setup

### 1.1 Start PostgreSQL Service

**Windows:**
1. Open Services (services.msc)
2. Find "PostgreSQL"
3. Right-click → **Start**
4. Status should show "Running"

**Or via Command:**
```powershell
net start postgresql-x64-16  # Replace 16 with your version
```

### 1.2 Verify PostgreSQL is Running

```bash
psql --version
# Should show: psql (PostgreSQL) 16.x (or your version)
```

### 1.3 Access pgAdmin

1. Open browser: `http://localhost:5050` or `http://localhost:5432`
2. Login with your pgAdmin credentials
3. You should see the Server tree on the left

---

## Phase 2: Create Database via pgAdmin

### 2.1 Create Database

1. In pgAdmin, right-click **Databases** (under your PostgreSQL server)
2. Click **Create** → **Database**
3. Enter:
   - **Database name**: `szpos`
   - Leave other settings default
4. Click **Save**
5. ✅ Database `szpos` created

### 2.2 Create User (Login Role)

1. In pgAdmin, right-click **Login/Group Roles**
2. Click **Create** → **Login/Group Role**
3. In **General** tab:
   - **Name**: `szpos_user`
4. In **Definition** tab:
   - **Password**: `szpos_password`
   - Leave other settings default
5. In **Privileges** tab:
   - ✅ Check: **Can login**
   - ✅ Check: **Can create DB**
   - ✅ Check: **Superuser** (for development)
6. Click **Save**
7. ✅ User `szpos_user` created

### 2.3 Grant Database Permissions

1. In pgAdmin, click on **szpos** database
2. Open **Tools** → **Query Tool** (or press Alt+F)
3. Copy and paste this SQL:

```sql
-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE szpos TO szpos_user;

-- Grant schema permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO szpos_user;

-- Grant default table privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TYPES TO szpos_user;

-- Grant CREATEDB for migrations/shadow database
ALTER ROLE szpos_user CREATEDB;
```

4. Click **Execute** (F6 or Run button)
5. ✅ Permissions granted

### 2.4 Verify Connection

Run this in the Query Tool:

```sql
SELECT 1;
```

Should return: `1`

---

## Phase 3: Configure SzPOS Application

### 3.1 Verify .env File

Check `apps/api/.env`:

```env
DATABASE_URL="postgresql://szpos_user:szpos_password@localhost:5432/szpos"
PORT=4000
```

If different, update it to match your PostgreSQL setup.

### 3.2 Verify Prisma Schema

Check `apps/api/prisma/schema.prisma` has:

```prisma
datasource db {
  provider = "postgresql"
}
```

---

## Phase 4: Initialize Database Schema

### 4.1 Push Schema to Database

```bash
cd apps/api

# Push Prisma schema to PostgreSQL
npx prisma db push
```

Expected output:
```
✔ Your database is now in sync with your Prisma schema.
```

If you get permission errors:
- Run the SQL grant commands from **Phase 2.3** again
- Restart PostgreSQL service

### 4.2 Seed Initial Data

```bash
npm run prisma:seed
```

Expected output:
```
🌱 Seeding database...
✅ Database seeded successfully
📦 Created 4 products
👥 Created 3 users
```

### 4.3 View Database Visually (Optional)

```bash
npx prisma studio
```

This opens `http://localhost:5555` with a visual database explorer.

---

## Phase 5: Run Application

### Terminal 1 - API Server

```bash
cd apps/api
npm run dev
```

Expected output:
```
✅ Database ready
🚀 API listening on http://localhost:4000
```

### Terminal 2 - Web Server

```bash
cd apps/web
npm run dev
```

Expected output:
```
VITE ready in XXX ms
➜ Local: http://localhost:5175/
```

### 3. Open Application

Open browser: `http://localhost:5175`

✅ Products should load from PostgreSQL database!

---

## Troubleshooting

### "connection refused" or "could not connect"

**Check 1: PostgreSQL Running?**
```bash
# Test connection
psql -U szpos_user -d szpos -c "SELECT 1"
```

If fails:
1. Open Services (windows)
2. Find PostgreSQL → Right-click → Start
3. Retry

**Check 2: DATABASE_URL Correct?**
```bash
cat apps/api/.env | grep DATABASE_URL
# Should show correct connection string
```

### "permission denied for schema public"

Run these SQL commands in pgAdmin Query Tool:

```sql
GRANT ALL PRIVILEGES ON SCHEMA public TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO szpos_user;
```

### "CREATEDB permission denied"

Run in pgAdmin Query Tool:

```sql
ALTER ROLE szpos_user CREATEDB;
```

### Products not showing

1. Check API is running: `curl http://localhost:4000/api/products`
2. Check database has data: In pgAdmin Query Tool:
   ```sql
   SELECT COUNT(*) FROM products;
   ```

### Prisma schema validation error

```bash
# Regenerate Prisma client
npx prisma generate
```

---

## Useful Commands Reference

```bash
# Start API
cd apps/api && npm run dev

# Start Web
cd apps/web && npm run dev

# View database (visual UI)
cd apps/api && npx prisma studio

# Push schema changes
cd apps/api && npx prisma db push

# Seed database
cd apps/api && npm run prisma:seed

# Check database connection
psql -U szpos_user -d szpos -c "SELECT 1"

# View database in pgAdmin
# Open browser: http://localhost:5050
```

---

## Security Notes

⚠️ **Development Only**: The credentials above are for development. For production:
- Use strong passwords
- Use environment-specific credentials
- Enable SSL connections
- Restrict database access by IP
- Use managed database services

---

## Next Steps

1. ✅ PostgreSQL running
2. ✅ pgAdmin configured  
3. ✅ Database created
4. ✅ User created with permissions
5. ✅ Schema pushed
6. ✅ Data seeded
7. ✅ API running on port 4000
8. ✅ Web running on port 5175

**Application is ready for development!** 🎉
