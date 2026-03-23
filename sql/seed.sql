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

-- Initial User for testing
INSERT INTO Users (FirstName, LastName, Email, Phone, PlanId, MaxProperties) 
VALUES ('Test', 'User', 'miguelpinto.dev@gmail.com', '999888777', 3, 50)
ON CONFLICT (Email) DO NOTHING;

-- Sample Property
INSERT INTO Properties (OwnerId, OperationType, PropertyType, Price, Area, LocationText, Rooms, Bathrooms, ParkingSpots, FloorNumber, HasElevator, Description, Status, IsFeatured)
SELECT Id, 'Venta', 'Departamento', 250000, 120, 'Miraflores, Lima', 3, 2, 1, 5, TRUE, 'Hermoso departamento con vista al mar.', 'Aprobada', TRUE
FROM Users WHERE Email = 'miguelpinto.dev@gmail.com'
LIMIT 1;

-- Sample Image
INSERT INTO PropertyImages (PropertyId, ImageUrl, PublicId, Orden)
SELECT Id, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1000', 'sample_1', 1
FROM Properties WHERE LocationText = 'Miraflores, Lima'
LIMIT 1;
