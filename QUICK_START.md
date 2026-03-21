# 🚀 SzPOS Database Setup Checklist

## Quick Start (10 minutes)

Follow these steps in order to complete database setup:

### ✅ Step 1: PostgreSQL & pgAdmin (Pre-requisite)
- [ ] PostgreSQL installed and running
- [ ] pgAdmin installed and accessible at http://localhost:5050

### ✅ Step 2: Create Database in pgAdmin

**Via pgAdmin UI:**
1. Right-click **Databases** → Create → Database
2. Name: `szpos`
3. Click Save

```sql
-- Or run this SQL in pgAdmin Query Tool:
CREATE DATABASE szpos;
```

### ✅ Step 3: Create User in pgAdmin

**Via pgAdmin UI:**
1. Right-click **Login/Group Roles** → Create → Login/Group Role
2. Name: `szpos_user`
3. In Definition tab: Password: `szpos_password`
4. In Privileges tab: Enable "Can login", "Can create DB"
5. Click Save

```sql
-- Or run this SQL in pgAdmin Query Tool:
CREATE USER szpos_user WITH PASSWORD 'szpos_password';
ALTER ROLE szpos_user CREATEDB;
```

### ✅ Step 4: Grant Permissions

**Run this SQL in pgAdmin Query Tool (connected to szpos database):**

```sql
GRANT ALL PRIVILEGES ON DATABASE szpos TO szpos_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO szpos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO szpos_user;
```

### ✅ Step 5: Initialize Database Schema

```bash
cd apps/api

# Push Prisma schema to database
npx prisma db push
```

Expected: `✔ Your database is now in sync with your Prisma schema.`

### ✅ Step 6: Seed Initial Data

```bash
# Still in apps/api
npm run prisma:seed
```

Expected:
```
✅ Database seeded successfully
📦 Created 4 products
👥 Created 3 users
```

### ✅ Step 7: Verify Database

In pgAdmin Query Tool:
```sql
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM users;
```

Should show: `4` products and `3` users

### ✅ Step 8: Start Application

**Terminal 1:**
```bash
cd apps/api
npm run dev
```

**Terminal 2:**
```bash
cd apps/web
npm run dev
```

**Browser:**
Open http://localhost:5175

---

## 🎯 Your Configuration

### Environment Variables
- **DATABASE_URL**: `postgresql://szpos_user:szpos_password@localhost:5432/szpos`
- **API Port**: `4000`
- **Web Port**: `5175` (or next available)

### Database Credentials
- **Database**: `szpos`
- **User**: `szpos_user`
- **Password**: `szpos_password`
- **Host**: `localhost`
- **Port**: `5432`

### Application URLs
- **API**: http://localhost:4000
- **Web**: http://localhost:5175
- **pgAdmin**: http://localhost:5050
- **Prisma Studio**: http://localhost:5555 (after running `npx prisma studio`)

---

## 🐛 If Something Goes Wrong

### Database connection fails
```bash
# Test connection
psql -U szpos_user -d szpos -c "SELECT 1"
```

### Permission errors
Re-run the GRANT commands in pgAdmin Query Tool

### Prisma errors
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### Start from scratch
```bash
# Reset (warning: will delete all data)
cd apps/api
npx prisma db execute --stdin < drop.sql
npx prisma db push
npm run prisma:seed
```

---

## ✨ Success Indicators

✅ Database setup is complete when:
1. All steps above completed without errors
2. `curl http://localhost:4000/api/products` returns JSON with 4 products
3. Web app at http://localhost:5175 loads without error
4. Products display on sale screen
5. pgAdmin shows tables with data

---

## 📚 Additional Resources

- [Full Setup Guide](./DATABASE_SETUP_COMPLETE.md)
- [pgAdmin Setup Details](./PGADMIN_SETUP.md)
- [Prisma Docs](./PRISMA_SETUP.md)
- Prisma Studio: Run `npx prisma studio` in apps/api

---

## 💡 Pro Tips

1. Keep pgAdmin tab open during development
2. Use Prisma Studio to view/edit data visually
3. Check `.env` file if connection fails
4. PostgreSQL service must be running before starting API

**Happy coding! 🎉**
