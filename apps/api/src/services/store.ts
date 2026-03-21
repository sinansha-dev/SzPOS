import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create connection pool and adapter for Prisma v7
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  max: 20, // Max connection pool size
});
const adapter = new PrismaPg(pool);

// Initialize Prisma client with PostgreSQL adapter
export const prisma = new PrismaClient({
  adapter,
  errorFormat: "pretty",
});

// Initialize function to populate database if empty
export async function initializeDatabase() {
  const productCount = await prisma.product.count();

  if (productCount === 0) {
    console.log("📦 Seeding initial products...");
    await prisma.product.createMany({
      data: [
        { id: "p_001", sku: "CAKE-001", name: "Chocolate Cake", price: "120.00", taxRate: "0.05", stock: 12 },
        { id: "p_002", sku: "DNT-001", name: "Donut", price: "40.00", taxRate: "0.05", stock: 50 },
        { id: "p_003", sku: "CKI-001", name: "Cookie", price: "30.00", taxRate: "0.05", stock: 80 },
        { id: "p_004", sku: "BRW-001", name: "Brownie", price: "60.00", taxRate: "0.05", stock: 25 }
      ]
    });
    console.log("✅ Database initialized with sample products");
  }

  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log("👥 Seeding initial users...");
    await prisma.user.createMany({
      data: [
        { id: "u_001", name: "Admin User", username: "admin", role: "admin", status: "active" },
        { id: "u_002", name: "John Cashier", username: "john", role: "cashier", status: "active" },
        { id: "u_003", name: "Jane Manager", username: "jane", role: "manager", status: "active" }
      ]
    });
    console.log("✅ Database initialized with sample users");
  }
}
