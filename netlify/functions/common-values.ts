import { Handler } from '@netlify/functions';
import { query } from './utils/db';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const result = await query(
      'SELECT Id, Tipo, Codigo, Descripcion, Orden FROM ValoresComunes WHERE Activo = TRUE ORDER BY Tipo, Orden'
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
  } catch (error) {
    console.error('Common Values Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
