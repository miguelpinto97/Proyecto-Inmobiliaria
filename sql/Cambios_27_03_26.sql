-- Database Migration Script
-- Date: 2026-03-27
-- Description: Structural changes to use IDs for common values and move features to a dedicated table.

-- 1. Add new features to ValoresComunes
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES 
('Caracteristica', 'AireAcondicionado', 'Aire Acondicionado', 1),
('Caracteristica', 'Calefaccion', 'Calefacción', 2),
('Caracteristica', 'TermaGas', 'Terma a gas', 3),
('Caracteristica', 'TermaElectrica', 'Terma eléctrica', 4),
('Caracteristica', 'GasNatural', 'Gas natural', 5),
('Caracteristica', 'FrenteParque', 'Frente a un parque', 6),
('Caracteristica', 'LavanderiaCerrada', 'Área de Lavandería cerrada', 7),
('Caracteristica', 'LavanderiaAbierta', 'Área de lavandería abierta', 8),
('Caracteristica', 'Ascensor', 'Ascensor', 9),
('Caracteristica', 'Seguridad24h', 'Seguridad 24h', 10),
('Caracteristica', 'Gimnasio', 'Gimnasio', 11),
('Caracteristica', 'Piscina', 'Piscina', 12),
('Caracteristica', 'ZonaParrillas', 'Zona de Parrillas', 13),
('Caracteristica', 'CocheraVisitas', 'Cochera de Visitas', 14),
('Caracteristica', 'AceptaMascotas', 'Acepta Mascotas', 15)
ON CONFLICT (Tipo, Codigo) DO NOTHING;

-- 2. Create PropertyFeatures table
CREATE TABLE IF NOT EXISTS PropertyFeatures (
    PropertyId INTEGER REFERENCES Properties(Id) ON DELETE CASCADE,
    FeatureId INTEGER REFERENCES ValoresComunes(Id) ON DELETE CASCADE,
    PRIMARY KEY (PropertyId, FeatureId)
);

-- 3. Migrate HasElevator data from Properties to PropertyFeatures
INSERT INTO PropertyFeatures (PropertyId, FeatureId)
SELECT p.Id, v.Id
FROM Properties p
JOIN ValoresComunes v ON v.Tipo = 'Caracteristica' AND v.Codigo = 'Ascensor'
WHERE p.HasElevator = TRUE
ON CONFLICT DO NOTHING;

-- 4. Drop HasElevator from Properties
ALTER TABLE Properties DROP COLUMN IF EXISTS HasElevator;

-- 5. Prepare Foreign Keys for Properties table
-- Add temporary ID columns
ALTER TABLE Properties 
ADD COLUMN OperationTypeId INTEGER,
ADD COLUMN PropertyTypeId INTEGER,
ADD COLUMN DistrictId INTEGER,
ADD COLUMN StatusId INTEGER;

-- Update new columns based on existing VARCHAR values
UPDATE Properties p SET OperationTypeId = v.Id FROM ValoresComunes v WHERE v.Tipo = 'TipoOperacion' AND v.Codigo = p.OperationType;
UPDATE Properties p SET PropertyTypeId = v.Id FROM ValoresComunes v WHERE v.Tipo = 'TipoInmueble' AND v.Codigo = p.PropertyType;
UPDATE Properties p SET DistrictId = v.Id FROM ValoresComunes v WHERE v.Tipo = 'Distrito' AND v.Codigo = p.District;
UPDATE Properties p SET StatusId = v.Id FROM ValoresComunes v WHERE v.Tipo = 'EstadoPropiedad' AND v.Codigo = p.Status;

-- Finalize Properties table columns
ALTER TABLE Properties DROP COLUMN OperationType;
ALTER TABLE Properties DROP COLUMN PropertyType;
ALTER TABLE Properties DROP COLUMN District;
ALTER TABLE Properties DROP COLUMN Status;

ALTER TABLE Properties RENAME COLUMN OperationTypeId TO OperationTypeId; -- Already named so, but keeping for logic
ALTER TABLE Properties ADD CONSTRAINT fk_properties_operation FOREIGN KEY (OperationTypeId) REFERENCES ValoresComunes(Id);
ALTER TABLE Properties ADD CONSTRAINT fk_properties_type FOREIGN KEY (PropertyTypeId) REFERENCES ValoresComunes(Id);
ALTER TABLE Properties ADD CONSTRAINT fk_properties_district FOREIGN KEY (DistrictId) REFERENCES ValoresComunes(Id);
ALTER TABLE Properties ADD CONSTRAINT fk_properties_status FOREIGN KEY (StatusId) REFERENCES ValoresComunes(Id);

-- 6. Prepare Foreign Keys for BuyerRequirements table
-- Add temporary ID columns (Note: PropertyTypeId might be new here)
ALTER TABLE BuyerRequirements 
ADD COLUMN OperationTypeId INTEGER,
ADD COLUMN PropertyTypeId INTEGER,
ADD COLUMN FloorPreferenceId INTEGER;

-- Update new columns
UPDATE BuyerRequirements r SET OperationTypeId = v.Id FROM ValoresComunes v WHERE v.Tipo = 'TipoOperacion' AND v.Codigo = r.OperationType;
UPDATE BuyerRequirements r SET FloorPreferenceId = v.Id FROM ValoresComunes v WHERE v.Tipo = 'TipoPiso' AND v.Codigo = r.FloorPreference;
-- PropertyType was likely not in the table yet, so we'll leave it NULL and let users re-set it or add it later if needed, 
-- but if some data exists (from the previous attempt to insert), we try to match it.
-- ALTER TABLE BuyerRequirements ADD COLUMN PropertyType VARCHAR(50); -- Just in case it wasn't there
UPDATE BuyerRequirements r SET PropertyTypeId = v.Id FROM ValoresComunes v WHERE v.Tipo = 'TipoInmueble' AND v.Codigo = r.PropertyType;

-- Finalize BuyerRequirements columns
ALTER TABLE BuyerRequirements DROP COLUMN OperationType;
ALTER TABLE BuyerRequirements DROP COLUMN FloorPreference;
-- If PropertyType existed as VARCHAR, drop it
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='buyerrequirements' AND column_name='propertytype') THEN
        ALTER TABLE BuyerRequirements DROP COLUMN PropertyType;
    END IF;
END $$;

ALTER TABLE BuyerRequirements ADD CONSTRAINT fk_requirements_operation FOREIGN KEY (OperationTypeId) REFERENCES ValoresComunes(Id);
ALTER TABLE BuyerRequirements ADD CONSTRAINT fk_requirements_type FOREIGN KEY (PropertyTypeId) REFERENCES ValoresComunes(Id);
ALTER TABLE BuyerRequirements ADD CONSTRAINT fk_requirements_floor FOREIGN KEY (FloorPreferenceId) REFERENCES ValoresComunes(Id);

-- 7. Update Users table (District)
ALTER TABLE Users ADD COLUMN DistrictId INTEGER;
UPDATE Users u SET DistrictId = v.Id FROM ValoresComunes v WHERE v.Tipo = 'Distrito' AND v.Codigo = u.District;
ALTER TABLE Users DROP COLUMN District;
ALTER TABLE Users ADD CONSTRAINT fk_users_district FOREIGN KEY (DistrictId) REFERENCES ValoresComunes(Id);
