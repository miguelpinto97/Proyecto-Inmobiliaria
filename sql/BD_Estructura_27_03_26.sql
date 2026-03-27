-- Database Structure for Inmobiliaria Modelo Flash
-- Date: 2026-03-27
-- Full schema with ID-based relations and PropertyFeatures table.

-- Roles Table
CREATE TABLE IF NOT EXISTS Roles (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(50) UNIQUE NOT NULL
);

-- ValoresComunes Table (Dynamic Dropdowns)
CREATE TABLE IF NOT EXISTS ValoresComunes (
    Id SERIAL PRIMARY KEY,
    Tipo VARCHAR(50) NOT NULL,
    Codigo VARCHAR(50) NOT NULL,
    Descripcion VARCHAR(255) NOT NULL,
    Activo BOOLEAN DEFAULT TRUE,
    Orden INTEGER DEFAULT 0,
    UNIQUE(Tipo, Codigo)
);

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    Id SERIAL PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    Phone VARCHAR(20),
    PhonePrefix VARCHAR(10) DEFAULT '+51',
    IsPhoneValidated BOOLEAN DEFAULT FALSE,
    Address TEXT,
    DistrictId INTEGER REFERENCES ValoresComunes(Id),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PlanId INTEGER DEFAULT 1,
    MaxProperties INTEGER DEFAULT 3
);

-- UserRoles Table
CREATE TABLE IF NOT EXISTS UserRoles (
    UserId INTEGER REFERENCES Users(Id) ON DELETE CASCADE,
    RoleId INTEGER REFERENCES Roles(Id) ON DELETE CASCADE,
    PRIMARY KEY (UserId, RoleId)
);

-- Properties Table
CREATE TABLE IF NOT EXISTS Properties (
    Id SERIAL PRIMARY KEY,
    OwnerId INTEGER REFERENCES Users(Id) ON DELETE CASCADE,
    OperationTypeId INTEGER REFERENCES ValoresComunes(Id),
    PropertyTypeId INTEGER REFERENCES ValoresComunes(Id),
    Price DECIMAL(15, 2) NOT NULL,
    Area DECIMAL(10, 2) NOT NULL,
    DistrictId INTEGER REFERENCES ValoresComunes(Id),
    Address TEXT NOT NULL,
    LocationText TEXT, 
    Rooms INTEGER DEFAULT 0,
    Bathrooms INTEGER DEFAULT 0,
    ParkingSpots INTEGER DEFAULT 0,
    FloorNumber INTEGER,
    Description TEXT,
    StatusId INTEGER REFERENCES ValoresComunes(Id),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsFeatured BOOLEAN DEFAULT FALSE
);

-- PropertyFeatures Table
CREATE TABLE IF NOT EXISTS PropertyFeatures (
    PropertyId INTEGER REFERENCES Properties(Id) ON DELETE CASCADE,
    FeatureId INTEGER REFERENCES ValoresComunes(Id) ON DELETE CASCADE,
    PRIMARY KEY (PropertyId, FeatureId)
);

-- PropertyImages Table
CREATE TABLE IF NOT EXISTS PropertyImages (
    Id SERIAL PRIMARY KEY,
    PropertyId INTEGER REFERENCES Properties(Id) ON DELETE CASCADE,
    ImageUrl TEXT NOT NULL,
    PublicId TEXT,
    Orden INTEGER DEFAULT 0
);

-- BuyerRequirements Table
CREATE TABLE IF NOT EXISTS BuyerRequirements (
    Id SERIAL PRIMARY KEY,
    UserId INTEGER REFERENCES Users(Id) ON DELETE CASCADE,
    OperationTypeId INTEGER REFERENCES ValoresComunes(Id),
    PropertyTypeId INTEGER REFERENCES ValoresComunes(Id),
    MinPrice DECIMAL(15, 2),
    MaxPrice DECIMAL(15, 2),
    MinArea DECIMAL(10, 2),
    ParkingRequired BOOLEAN DEFAULT FALSE,
    FloorPreferenceId INTEGER REFERENCES ValoresComunes(Id),
    ElevatorRequired BOOLEAN DEFAULT FALSE, -- Keeping this? Or move to features? Usually requirements still have direct flags for core desires.
    MinRooms INTEGER DEFAULT 0,
    MinBathrooms INTEGER DEFAULT 0,
    HasSala BOOLEAN DEFAULT FALSE,
    HasComedor BOOLEAN DEFAULT FALSE,
    DistrictId INTEGER REFERENCES ValoresComunes(Id), -- Added for better matching
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches Table
CREATE TABLE IF NOT EXISTS Matches (
    Id SERIAL PRIMARY KEY,
    PropertyId INTEGER REFERENCES Properties(Id) ON DELETE CASCADE,
    RequirementId INTEGER REFERENCES BuyerRequirements(Id) ON DELETE CASCADE,
    Score DECIMAL(5, 2),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(PropertyId, RequirementId)
);

-- Plans Table
CREATE TABLE IF NOT EXISTS Plans (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    MaxProperties INTEGER NOT NULL,
    Price DECIMAL(10, 2) DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON Properties(StatusId);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON Properties(OwnerId);
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(Email);
CREATE INDEX IF NOT EXISTS idx_valores_comunes_tipo ON ValoresComunes(Tipo);
CREATE INDEX IF NOT EXISTS idx_matches_property ON Matches(PropertyId);
CREATE INDEX IF NOT EXISTS idx_matches_requirement ON Matches(RequirementId);

-- Initial Seed Data
INSERT INTO Roles (Name) VALUES ('Admin'), ('Usuario'), ('Vendedor') ON CONFLICT (Name) DO NOTHING;

INSERT INTO Plans (Name, MaxProperties, Price) VALUES ('Básico', 3, 0.00), ('Pro', 10, 19.99), ('Premium', 50, 49.99) ON CONFLICT DO NOTHING;

INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES 
('TipoOperacion', 'Venta', 'Venta', 1),
('TipoOperacion', 'Alquiler', 'Alquiler', 2),
('TipoInmueble', 'Casa', 'Casa', 1),
('TipoInmueble', 'Departamento', 'Departamento', 2),
('TipoInmueble', 'Oficina', 'Oficina', 3),
('TipoInmueble', 'Terreno', 'Terreno', 4),
('EstadoPropiedad', 'Pendiente', 'Pendiente de Revisión', 1),
('EstadoPropiedad', 'Aprobada', 'Publicada', 2),
('EstadoPropiedad', 'Rechazada', 'Rechazada', 3),
('EstadoPropiedad', 'Vendido', 'Vendido', 4),
('EstadoPropiedad', 'Alquilado', 'Alquilado', 5),
('TipoPiso', 'PrimerPiso', 'Primer Piso', 1),
('TipoPiso', 'Elevado', 'Elevado', 2),
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


-- Seed Data for Inmobiliaria Modelo Flash

-- Roles
INSERT INTO Roles (Name) VALUES ('Admin'), ('Usuario'), ('Vendedor') ON CONFLICT (Name) DO NOTHING;

-- Plans
INSERT INTO Plans (Name, MaxProperties, Price) VALUES ('Básico', 3, 0.00), ('Pro', 10, 19.99), ('Premium', 50, 49.99) ON CONFLICT DO NOTHING;

-- ValoresComunes
-- Operation Type
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('TipoOperacion', 'Venta', 'Venta', 1) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('TipoOperacion', 'Alquiler', 'Alquiler', 2) ON CONFLICT (Tipo, Codigo) DO NOTHING;

-- Floor Preference
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('TipoPiso', 'PrimerPiso', 'Primer Piso', 1) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('TipoPiso', 'Elevado', 'Elevado', 2) ON CONFLICT (Tipo, Codigo) DO NOTHING;

-- Property Types (Extra)
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('TipoInmueble', 'Casa', 'Casa', 1) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('TipoInmueble', 'Departamento', 'Departamento', 2) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('TipoInmueble', 'Oficina', 'Oficina', 3) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('TipoInmueble', 'Terreno', 'Terreno', 4) ON CONFLICT (Tipo, Codigo) DO NOTHING;

-- Property Statuses
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('EstadoPropiedad', 'Pendiente', 'Pendiente de Revisión', 1) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('EstadoPropiedad', 'Aprobada', 'Publicada', 2) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('EstadoPropiedad', 'Rechazada', 'Rechazada', 3) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('EstadoPropiedad', 'Vendido', 'Vendido', 4) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('EstadoPropiedad', 'Alquilado', 'Alquilado', 5) ON CONFLICT (Tipo, Codigo) DO NOTHING;

-- Districts (Top 20 Lima)
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'Miraflores', 'Miraflores', 1) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'SanIsidro', 'San Isidro', 2) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'SantiagoDeSurco', 'Santiago de Surco', 3) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'SanBorja', 'San Borja', 4) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'LaMolina', 'La Molina', 5) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'Barranco', 'Barranco', 6) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'JesusMaria', 'Jesús María', 7) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'MagdalenaDelMar', 'Magdalena del Mar', 8) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'SanMiguel', 'San Miguel', 9) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'Lince', 'Lince', 10) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'PuebloLibre', 'Pueblo Libre', 11) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'Surquillo', 'Surquillo', 12) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'Chorrillos', 'Chorrillos', 13) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'SanJuanDeLurigancho', 'San Juan de Lurigancho', 14) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'LosOlivos', 'Los Olivos', 15) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'LaVictoria', 'La Victoria', 16) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'CercadoDeLima', 'Cercado de Lima', 17) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'Ate', 'Ate', 18) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'VillaElSalvador', 'Villa El Salvador', 19) ON CONFLICT (Tipo, Codigo) DO NOTHING;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden) VALUES ('Distrito', 'SanJuanDeMiraflores', 'San Juan de Miraflores', 20) ON CONFLICT (Tipo, Codigo) DO NOTHING;


ALTER TABLE Properties ADD COLUMN IF NOT EXISTS Latitude DECIMAL(10, 8);
ALTER TABLE Properties ADD COLUMN IF NOT EXISTS Longitude DECIMAL(11, 8);
ALTER TABLE Properties ADD COLUMN IF NOT EXISTS IsAddressPublic BOOLEAN DEFAULT TRUE;
ALTER TABLE Properties ADD COLUMN IF NOT EXISTS Reference TEXT;


ALTER TABLE Users DROP COLUMN IF EXISTS DistrictId;
ALTER TABLE Users DROP COLUMN IF EXISTS District; -- Por si quedaba rastro del nombre antiguo

ALTER TABLE Users DROP COLUMN IF EXISTS Address;

INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden, Activo)
VALUES ('TipoInmueble', 'MiniDepa', 'Mini Depa', 5, TRUE)
ON CONFLICT (Tipo, Codigo) DO UPDATE SET Descripcion = EXCLUDED.Descripcion, Orden = EXCLUDED.Orden, Activo = TRUE;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden, Activo)
VALUES ('TipoInmueble', 'MonoAmbiente', 'Mono Ambiente', 6, TRUE)
ON CONFLICT (Tipo, Codigo) DO UPDATE SET Descripcion = EXCLUDED.Descripcion, Orden = EXCLUDED.Orden, Activo = TRUE;