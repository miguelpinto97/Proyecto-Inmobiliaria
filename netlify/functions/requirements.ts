import { Handler } from '@netlify/functions';
import { query } from './utils/db';
import { verifyToken, isAdmin } from './utils/authMiddleware';

export const handler: Handler = async (event) => {
  const user = verifyToken(event);
  if (!user) return { statusCode: 401, body: 'Unauthorized' };

  const method = event.httpMethod;

  try {
    if (method === 'GET') {
      const result = await query('SELECT * FROM BuyerRequirements WHERE UserId = $1 ORDER BY CreatedAt DESC', [user.userId]);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows),
      };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { operationType, minPrice, maxPrice, minArea, parkingRequired, floorPreference, elevatorRequired, minRooms, minBathrooms, hasSala, hasComedor } = body;

      const result = await query(
        `INSERT INTO BuyerRequirements (UserId, OperationType, MinPrice, MaxPrice, MinArea, ParkingRequired, FloorPreference, ElevatorRequired, MinRooms, MinBathrooms, HasSala, HasComedor)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [user.userId, operationType, minPrice, maxPrice, minArea, parkingRequired, floorPreference, elevatorRequired, minRooms, minBathrooms, hasSala, hasComedor]
      );

      // Trigger Matching calculation (Logic could be in a separate service or here)
      // For now, let's keep it simple and just return the requirement.
      // Matching can be fetched via /matching?requirementId=...

      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows[0]),
      };
    }

    if (method === 'DELETE') {
      const { id } = event.queryStringParameters || {};
      await query('DELETE FROM BuyerRequirements WHERE Id = $1 AND UserId = $2', [id, user.userId]);
      return { statusCode: 200, body: 'Deleted' };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    console.error('Requirements Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
