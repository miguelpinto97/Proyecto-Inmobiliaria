-- Database Schema for Inmobiliaria Modelo Flash

-- Roles Table
CREATE TABLE IF NOT EXISTS Roles (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(50) UNIQUE NOT NULL
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
    District VARCHAR(50),
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

-- Properties Table
CREATE TABLE IF NOT EXISTS Properties (
    Id SERIAL PRIMARY KEY,
    OwnerId INTEGER REFERENCES Users(Id) ON DELETE CASCADE,
    OperationType VARCHAR(20) NOT NULL, -- 'Venta', 'Alquiler'
    Price DECIMAL(15, 2) NOT NULL,
    Area DECIMAL(10, 2) NOT NULL,
    District VARCHAR(50) NOT NULL,
    Address TEXT NOT NULL,
    LocationText TEXT, -- Legacy, will keep for backward compatibility or remove later
    Rooms INTEGER DEFAULT 0,
    Bathrooms INTEGER DEFAULT 0,
    ParkingSpots INTEGER DEFAULT 0,
    FloorNumber INTEGER,
    HasElevator BOOLEAN DEFAULT FALSE,
    Description TEXT,
    Status VARCHAR(20) DEFAULT 'Pendiente', -- 'Pendiente', 'Aprobada', 'Rechazada'
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsFeatured BOOLEAN DEFAULT FALSE
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
    OperationType VARCHAR(20) NOT NULL,
    MinPrice DECIMAL(15, 2),
    MaxPrice DECIMAL(15, 2),
    MinArea DECIMAL(10, 2),
    ParkingRequired BOOLEAN DEFAULT FALSE,
    FloorPreference VARCHAR(50), -- 'Primer Piso', 'Elevado'
    ElevatorRequired BOOLEAN DEFAULT FALSE,
    MinRooms INTEGER DEFAULT 0,
    MinBathrooms INTEGER DEFAULT 0,
    HasSala BOOLEAN DEFAULT FALSE,
    HasComedor BOOLEAN DEFAULT FALSE,
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

-- Plans Table (Future Monetization)
CREATE TABLE IF NOT EXISTS Plans (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    MaxProperties INTEGER NOT NULL,
    Price DECIMAL(10, 2) DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON Properties(Status);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON Properties(OwnerId);
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(Email);
CREATE INDEX IF NOT EXISTS idx_valores_comunes_tipo ON ValoresComunes(Tipo);
CREATE INDEX IF NOT EXISTS idx_matches_property ON Matches(PropertyId);
CREATE INDEX IF NOT EXISTS idx_matches_requirement ON Matches(RequirementId);
