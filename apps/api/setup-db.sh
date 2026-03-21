#!/bin/bash

# SzPOS Database Setup Helper Script
# Run this after PostgreSQL and pgAdmin are configured

echo "🔧 SzPOS Database Setup"
echo "======================="
echo ""

# Check if .env exists
if [ ! -f "apps/api/.env" ]; then
  echo "❌ Error: .env file not found in apps/api/"
  echo "Creating .env with default values..."
  cat > "apps/api/.env" << 'EOF'
DATABASE_URL="postgresql://szpos_user:szpos_password@localhost:5432/szpos"
PORT=4000
EOF
  echo "✅ Created .env"
fi

echo "📋 Checking database URL..."
grep DATABASE_URL apps/api/.env || echo "⚠️  DATABASE_URL not found in .env"

echo ""
echo "Step 1: Initialize Prisma schema..."
cd apps/api
npx prisma db push || {
  echo "⚠️  Database push failed - database may not be ready"
  echo "Please ensure:"
  echo "  1. PostgreSQL is running"
  echo "  2. Database 'szpos' exists"
  echo "  3. User 'szpos_user' has proper permissions"
  exit 1
}

echo ""
echo "Step 2: Seed initial data..."
npm run prisma:seed || {
  echo "⚠️  Seeding failed"
  exit 1
}

echo ""
echo "Step 3: Generate Prisma client..."
npx prisma generate

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start API server: npm run dev (in apps/api)"
echo "  2. Start Web: npm run dev (in apps/web)"
echo "  3. View database: npx prisma studio"
echo ""
