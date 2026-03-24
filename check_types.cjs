const { query } = require('./netlify/functions/utils/db');
require('dotenv').config();

async function run() {
  try {
    const res = await query("SELECT * FROM ValoresComunes WHERE Tipo = 'TipoInmueble' ORDER BY Orden");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
