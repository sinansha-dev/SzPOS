import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

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
        price: "120.00",
        taxRate: "0.05",
        stock: 12
      }
    }),
    prisma.product.create({
      data: {
        id: "p_002",
        sku: "DNT-001",
        name: "Donut",
        price: "40.00",
        taxRate: "0.05",
        stock: 50
      }
    }),
    prisma.product.create({
      data: {
        id: "p_003",
        sku: "CKI-001",
        name: "Cookie",
        price: "30.00",
        taxRate: "0.05",
        stock: 80
      }
    }),
    prisma.product.create({
      data: {
        id: "p_004",
        sku: "BRW-001",
        name: "Brownie",
        price: "60.00",
        taxRate: "0.05",
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
  console.log(`📦 Created ${products.length} products`);
  console.log(`👥 Created ${users.length} users`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
