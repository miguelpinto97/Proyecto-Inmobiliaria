-- Migration script for Inmobiliaria Modelo Flash - Reference Field Support
-- Date: 2026-03-23

-- Add Reference column to Properties table
ALTER TABLE Properties ADD COLUMN IF NOT EXISTS Reference TEXT;
