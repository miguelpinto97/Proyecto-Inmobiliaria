import { Handler } from '@netlify/functions';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { query } from './utils/db';

const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { idToken } = JSON.parse(event.body || '{}');
    if (!idToken) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing ID Token' }) };
    }

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid Google Token' }) };
    }

    const { email, given_name, family_name, picture } = payload;

    // Check if user exists
    let userResult = await query('SELECT * FROM Users WHERE Email = $1', [email]);
    let user = userResult.rows[0];

    if (!user) {
      // Create user
      const newUserResult = await query(
        'INSERT INTO Users (FirstName, LastName, Email, Phone) VALUES ($1, $2, $3, $4) RETURNING *',
        [given_name || '', family_name || '', email, '']
      );
      user = newUserResult.rows[0];

      // Assign role (Admin if email matches)
      const isAdmin = email === 'miguelpinto.dev@gmail.com';
      const roleName = isAdmin ? 'Admin' : 'Usuario';
      const roleResult = await query('SELECT Id FROM Roles WHERE Name = $1', [roleName]);
      const roleId = roleResult.rows[0].id;

      await query('INSERT INTO UserRoles (UserId, RoleId) VALUES ($1, $2)', [user.id, roleId]);
    }

    const rolesResult = await query(
      'SELECT r.Name FROM Roles r JOIN UserRoles ur ON r.Id = ur.RoleId WHERE ur.UserId = $1',
      [user.id]
    );
    const roles = rolesResult.rows.map(r => r.name);

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, roles },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, user: { ...user, roles } }),
    };
  } catch (error) {
    console.error('Auth Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
