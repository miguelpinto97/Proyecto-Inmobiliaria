-- Script de Corrección: Eliminar campo Distrito de Usuarios
-- Ejecutar este script para limpiar la tabla Users.

ALTER TABLE Users DROP COLUMN IF EXISTS DistrictId;
ALTER TABLE Users DROP COLUMN IF EXISTS District; -- Por si quedaba rastro del nombre antiguo
