-- Script de Corrección: Eliminar campo Dirección de Usuarios
-- Ejecutar este script para limpiar la tabla Users.

ALTER TABLE Users DROP COLUMN IF EXISTS Address;
