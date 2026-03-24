import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const values = [
      ['TipoInmueble', 'MiniDepa', 'Mini Depa', 5],
      ['TipoInmueble', 'MonoAmbiente', 'Mono Ambiente', 6]
    ];

    for (const [tipo, codigo, descripcion, orden] of values) {
      console.log(`Inserting ${descripcion}...`);
      await pool.query(
        'INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden, Activo) VALUES ($1, $2, $3, $4, TRUE) ON CONFLICT (Tipo, Codigo) DO UPDATE SET Descripcion = $3, Orden = $4, Activo = TRUE',
        [tipo, codigo, descripcion, orden]
      );
    }

    console.log('Successfully added new property types.');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error adding types:', err);
    await pool.end();
    process.exit(1);
  }
}

run();
