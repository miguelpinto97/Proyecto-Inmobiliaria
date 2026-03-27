-- Script de Corrección: Columnas Faltantes en Properties
-- Ejecutar este script para añadir las columnas necesarias para el mapa y referencias.

ALTER TABLE Properties ADD COLUMN IF NOT EXISTS Latitude DECIMAL(10, 8);
ALTER TABLE Properties ADD COLUMN IF NOT EXISTS Longitude DECIMAL(11, 8);
ALTER TABLE Properties ADD COLUMN IF NOT EXISTS IsAddressPublic BOOLEAN DEFAULT TRUE;
ALTER TABLE Properties ADD COLUMN IF NOT EXISTS Reference TEXT;

-- Opcional: Si deseas que la estructura completa esté sincronizada
-- UPDATE Properties SET IsAddressPublic = TRUE WHERE IsAddressPublic IS NULL;
