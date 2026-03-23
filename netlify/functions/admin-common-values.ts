import { Handler } from '@netlify/functions';
import { query } from './utils/db';
import { verifyToken, isAdmin } from './utils/authMiddleware';

export const handler: Handler = async (event) => {
  const user = verifyToken(event);
  if (!user || !isAdmin(user)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const { httpMethod } = event;

  try {
    if (httpMethod === 'GET') {
      const result = await query(
        'SELECT Tipo, Codigo, Descripcion, Orden, Activo FROM ValoresComunes ORDER BY Tipo, Orden'
      );
      
      // Group by type
      const grouped = result.rows.reduce((acc: any, curr: any) => {
        if (!acc[curr.tipo]) acc[curr.tipo] = [];
        acc[curr.tipo].push(curr);
        return acc;
      }, {});

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grouped),
      };
    }

    if (httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const { tipo, codigo, descripcion, orden } = data;

      if (!tipo || !codigo || !descripcion) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
      }

      await query(
        'INSERT INTO ValoresComunes (Tipo, Codigo, Descripcion, Orden, Activo) VALUES ($1, $2, $3, $4, TRUE) ON CONFLICT (Tipo, Codigo) DO UPDATE SET Descripcion = $3, Orden = $4, Activo = TRUE',
        [tipo, codigo, descripcion, orden || 0]
      );

      return { statusCode: 200, body: JSON.stringify({ message: 'Value upserted successfully' }) };
    }

    if (httpMethod === 'PUT') {
      const data = JSON.parse(event.body || '{}');
      const { tipo, codigo, descripcion, orden, activo } = data;

      if (!tipo || !codigo) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing Tipo or Codigo' }) };
      }

      const fields = [];
      const params = [];
      let i = 1;

      if (descripcion !== undefined) {
        fields.push(`Descripcion = $${i++}`);
        params.push(descripcion);
      }
      if (orden !== undefined) {
        fields.push(`Orden = $${i++}`);
        params.push(orden);
      }
      if (activo !== undefined) {
        fields.push(`Activo = $${i++}`);
        params.push(activo);
      }

      if (fields.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'No fields to update' }) };
      }

      params.push(tipo, codigo);
      await query(
        `UPDATE ValoresComunes SET ${fields.join(', ')} WHERE Tipo = $${i++} AND Codigo = $${i++}`,
        params
      );

      return { statusCode: 200, body: JSON.stringify({ message: 'Value updated successfully' }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };

  } catch (error) {
    console.error('Admin Common Values Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
