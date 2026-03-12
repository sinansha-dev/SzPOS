CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0.05,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin','cashier','manager')),
  status TEXT NOT NULL CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


INSERT INTO products (id, sku, name, price, tax_rate, stock)
VALUES
  ('p_001', 'CAKE-001', 'Chocolate Cake', 120, 0.05, 12),
  ('p_002', 'DNT-001', 'Donut', 40, 0.05, 50),
  ('p_003', 'CKI-001', 'Cookie', 30, 0.05, 80),
  ('p_004', 'BRW-001', 'Brownie', 60, 0.05, 25)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, username, role, status)
VALUES
  ('u_001', 'Admin User', 'admin', 'admin', 'active'),
  ('u_002', 'John Cashier', 'john', 'cashier', 'active'),
  ('u_003', 'Jane Manager', 'jane', 'manager', 'active')
ON CONFLICT (id) DO NOTHING;
