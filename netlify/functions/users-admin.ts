import { Handler } from '@netlify/functions';
import { query } from './utils/db';
import { verifyToken, isAdmin } from './utils/authMiddleware';

export const handler: Handler = async (event) => {
  const user = verifyToken(event);
  if (!user || !isAdmin(user)) return { statusCode: 401, body: 'Unauthorized' };

  const method = event.httpMethod;

  try {
    if (method === 'GET') {
      const result = await query('SELECT u.*, ARRAY_AGG(r.Name) as roles FROM Users u LEFT JOIN UserRoles ur ON u.Id = ur.UserId LEFT JOIN Roles r ON ur.RoleId = r.Id GROUP BY u.Id ORDER BY u.CreatedAt DESC');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows),
      };
    }

    if (method === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { id, maxProperties, roles, phone } = body;

      if (maxProperties !== undefined) {
        await query('UPDATE Users SET MaxProperties = $1 WHERE Id = $2', [maxProperties, id]);
      }

      if (phone !== undefined) {
        await query('UPDATE Users SET Phone = $1 WHERE Id = $2', [phone, id]);
      }

      if (roles && Array.isArray(roles)) {
        await query('DELETE FROM UserRoles WHERE UserId = $1', [id]);
        for (const roleName of roles) {
          const roleRes = await query('SELECT Id FROM Roles WHERE Name = $1', [roleName]);
          if (roleRes.rows.length > 0) {
            await query('INSERT INTO UserRoles (UserId, RoleId) VALUES ($1, $2)', [id, roleRes.rows[0].id]);
          }
        }
      }

      return { statusCode: 200, body: 'Updated' };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    console.error('Users Admin Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
