-- Migration script for Inmobiliaria Modelo Flash
-- Date: 2026-03-23

-- 1. Add PropertyType column to Properties table
ALTER TABLE Properties ADD COLUMN IF NOT EXISTS PropertyType VARCHAR(50);

-- 2. Ensure the 'Vendedor' role exists
-- (Note: ON CONFLICT requires a unique constraint, which Roles.Name has)

-- 3. Update existing properties with a default type if necessary
UPDATE Properties SET PropertyType = 'Departamento' WHERE PropertyType IS NULL;
