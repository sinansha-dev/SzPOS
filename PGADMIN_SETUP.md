# Complete PostgreSQL Setup for SzPOS with pgAdmin

This guide will help you set up PostgreSQL database and connect it to your SzPOS application using pgAdmin.

## Step 1: Open pgAdmin and Create Database

1. Open pgAdmin (usually at http://localhost:5050 or http://localhost:80)
2. Login with your pgAdmin credentials
3. Right-click **Databases** → Select **Create** → **Database**
4. Enter:
   - **Database name**: `szpos`
   - Click **Save**

## Step 2: Create Database User

1. In pgAdmin, go to **Login/Group Roles**
2. Right-click → **Create** → **Login/Group Role**
3. In the **General** tab:
   - **Name**: `szpos_user`
4. In the **Definition** tab:
   - **Password**: `szpos_password`
   - Toggle **Inherit rights from the parent role**: ON
5. In the **Privileges** tab:
   - Enable all checkboxes (especially **Can create DB**, **Can login**)
6. Click **Save**

## Step 3: Grant Permissions to User

1. Right-click the **szpos** database → **Properties**
2. Go to **Security** tab
3. Click **Grant** button in permissions section
4. Select **szpos_user** and grant **All privileges**
5. **Save**

**OR** use SQL (recommended for full permissions):

In pgAdmin:
1. Click on the **szpos** database
2. Open **Tools** → **Query Tool**
3. Run these SQL commands:

```sql
-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE szpos TO szpos_user;

-- Grant schema permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO szpos_user;

-- Grant default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TYPES TO szpos_user;

-- Grant CREATEDB for migrations
ALTER ROLE szpos_user CREATEDB;
```

Click **Execute** (F6)

## Step 4: Verify Connection

In pgAdmin Query Tool, run:

```sql
SELECT 1;
```

Should return: `1`

## Step 5: Initialize Database Schema

In your terminal:

```bash
cd apps/api

# Test connection first
npm run db:push

# If that works, seed the data
npm run prisma:seed
```

## Complete SQL Setup Script

If you prefer to run everything at once, execute this in pgAdmin Query Tool while connected as `postgres`:

```sql
-- Create database
CREATE DATABASE szpos;

-- Connect to szpos database
-- (In pgAdmin: change to szpos database, then run the rest)

-- Create user with password
CREATE USER szpos_user WITH PASSWORD 'szpos_password';

-- Grant all privileges on database to user
GRANT ALL PRIVILEGES ON DATABASE szpos TO szpos_user;

-- Connect as szpos and grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TYPES TO szpos_user;

-- Allow user to create databases (for tests/migrations)
ALTER ROLE szpos_user CREATEDB;

-- Verify
SELECT 1;
```

## Troubleshooting in pgAdmin

### Connection refused
- **Check**: Services → PostgreSQL is running
- **Fix**: Start PostgreSQL service from Services app

### "permission denied" for schema
- Run the SQL grant commands above in Query Tool
- Make sure you're connected to the correct database

### User can't login
- In pgAdmin: Roles → szpos_user → Definition tab → **Password** field must be set

### Can't create shadow database (for migrations)
- Run: `ALTER ROLE szpos_user CREATEDB;` as postgres user

## Next Steps

Once database is set up:

```bash
cd apps/api

# Initialize Prisma schema in database
npx prisma db push

# Seed initial data
npm run prisma:seed

# View database visually
npx prisma studio

# Start API server
npm run dev
```

## Verify Setup

Test the connection from your app:

```bash
curl http://localhost:4000/api/products
```

Should return all products from the database.
