import { Handler } from '@netlify/functions';
import { query } from './utils/db';
import { verifyToken } from './utils/authMiddleware';

export const handler: Handler = async (event) => {
  const user = verifyToken(event);
  if (!user) return { statusCode: 401, body: 'Unauthorized' };

  try {
    if (event.httpMethod === 'GET') {
      const result = await query('SELECT * FROM Users WHERE Id = $1', [user.userId]);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows[0]),
      };
    }

    if (event.httpMethod === 'PUT') {
      const { firstName, lastName, phone } = JSON.parse(event.body || '{}');
      
      const result = await query(
        `UPDATE Users SET 
          FirstName = $1, LastName = $2, Phone = $3, UpdatedAt = CURRENT_TIMESTAMP
         WHERE Id = $4 RETURNING *`,
        [firstName, lastName, phone, user.userId]
      );

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows[0]),
      };
    }

    if (event.httpMethod === 'POST') {
      const { upgrade } = JSON.parse(event.body || '{}');
      if (upgrade === 'Vendedor') {
        const roleResult = await query('SELECT Id FROM Roles WHERE Name = $1', ['Vendedor']);
        const roleId = roleResult.rows[0].id;
        await query('INSERT INTO UserRoles (UserId, RoleId) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.userId, roleId]);
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Upgraded to Vendedor' }),
        };
      }
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    console.error('User Profile Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
