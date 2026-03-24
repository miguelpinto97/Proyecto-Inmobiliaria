INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden, Activo)
VALUES ('TipoInmueble', 'MiniDepa', 'Mini Depa', 5, TRUE)
ON CONFLICT (Tipo, Codigo) DO UPDATE SET Descripcion = EXCLUDED.Descripcion, Orden = EXCLUDED.Orden, Activo = TRUE;
INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden, Activo)
VALUES ('TipoInmueble', 'MonoAmbiente', 'Mono Ambiente', 6, TRUE)
ON CONFLICT (Tipo, Codigo) DO UPDATE SET Descripcion = EXCLUDED.Descripcion, Orden = EXCLUDED.Orden, Activo = TRUE;