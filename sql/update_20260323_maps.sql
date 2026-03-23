-- Migration script for Inmobiliaria Modelo Flash - Maps Support
-- Date: 2026-03-23

-- Add Latitude and Longitude columns to Properties table
-- Using DECIMAL(10, 8) for Latitude and DECIMAL(11, 8) for Longitude 
-- to ensure high precision for GPS coordinates.

ALTER TABLE Properties ADD COLUMN IF NOT EXISTS Latitude DECIMAL(10, 8);
ALTER TABLE Properties ADD COLUMN IF NOT EXISTS Longitude DECIMAL(11, 8);
