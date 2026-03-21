# Prisma Setup Guide for SzPOS

This project now uses **Prisma** as the ORM for PostgreSQL database management.

## Prerequisites

- PostgreSQL installed and running
- `.env` file configured in `apps/api/` with DATABASE_URL

## 1) Setup PostgreSQL Database

```bash
sudo -u postgres psql
```

Run these SQL commands:

```sql
CREATE DATABASE szpos;
CREATE USER szpos_user WITH PASSWORD 'szpos_password';
GRANT ALL PRIVILEGES ON DATABASE szpos TO szpos_user;
\q
```

## 2) Configure Environment Variables

Create or update `apps/api/.env`:

```env
DATABASE_URL="postgresql://szpos_user:szpos_password@localhost:5432/szpos"
PORT=4000
```

## 3) Initialize Database with Prisma

Run migrations to create tables:

```bash
cd apps/api
npx prisma migrate dev --name init
```

Or push schema directly (development only):

```bash
npx prisma db push
```

## 4) Seed Initial Data

Create a seed file at `apps/api/prisma/seed.ts`:

```typescript
import { prisma } from "../src/services/store.js";

async function main() {
  // Delete existing data
  await prisma.sale.deleteMany();
  await prisma.return.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        id: "p_001",
        sku: "CAKE-001",
        name: "Chocolate Cake",
        price: 120,
        taxRate: 0.05,
        stock: 12
      }
    }),
    prisma.product.create({
      data: {
        id: "p_002",
        sku: "DNT-001",
        name: "Donut",
        price: 40,
        taxRate: 0.05,
        stock: 50
      }
    }),
    prisma.product.create({
      data: {
        id: "p_003",
        sku: "CKI-001",
        name: "Cookie",
        price: 30,
        taxRate: 0.05,
        stock: 80
      }
    }),
    prisma.product.create({
      data: {
        id: "p_004",
        sku: "BRW-001",
        name: "Brownie",
        price: 60,
        taxRate: 0.05,
        stock: 25
      }
    })
  ]);

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "u_001",
        name: "Admin User",
        username: "admin",
        role: "admin",
        status: "active"
      }
    }),
    prisma.user.create({
      data: {
        id: "u_002",
        name: "John Cashier",
        username: "john",
        role: "cashier",
        status: "active"
      }
    }),
    prisma.user.create({
      data: {
        id: "u_003",
        name: "Jane Manager",
        username: "jane",
        role: "manager",
        status: "active"
      }
    })
  ]);

  console.log("✅ Database seeded successfully");
  console.log(`Created ${products.length} products and ${users.length} users`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Then add to `apps/api/package.json` scripts:

```json
{
  "scripts": {
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio"
  }
}
```

Run seed:

```bash
npm run prisma:seed
```

## 5) Useful Prisma Commands

```bash
# View database in UI
npx prisma studio

# Create a migration
npx prisma migrate dev --name migration_name

# Push schema to database (dev only)
npx prisma db push

# Generate Prisma client
npx prisma generate

# Validate schema
npx prisma validate
```

## 6) Update API Routes

Your API routes now have access to Prisma. Example:

```typescript
import { prisma } from "../services/store.js";

export async function getProducts() {
  return await prisma.product.findMany();
}

export async function getProduct(id: string) {
  return await prisma.product.findUnique({ where: { id } });
}
```

## Migration from In-Memory to Database

The `store.ts` file now exports:
- `prisma` - Prisma client instance
- `getProducts()` - Async function to fetch all products
- `getUser()` - Async function to fetch single user
- `products` and `users` - Original arrays (for reference/seeding)

Update your routes to use async functions instead of direct array access.

## Troubleshooting

**Connection refused?**
- Ensure PostgreSQL is running: `pg_isready -h localhost -U szpos_user`
- Check DATABASE_URL in .env
- Verify database exists: `psql -U szpos_user -d szpos -c "SELECT 1"`

**Schema out of sync?**
- Run: `npx prisma db push` to update database
- Or: `npx prisma migrate dev` to create a migration

**Type errors?**
- Regenerate Prisma client: `npx prisma generate`
