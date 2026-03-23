-- Migration script for Inmobiliaria Modelo Flash - Privacy Support
-- Date: 2026-03-23

-- Add IsAddressPublic column to Properties table
-- Default to TRUE to maintain backward compatibility with existing listings.

ALTER TABLE Properties ADD COLUMN IF NOT EXISTS IsAddressPublic BOOLEAN DEFAULT TRUE;
