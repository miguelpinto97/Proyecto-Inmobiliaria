import { Handler } from '@netlify/functions';
import { query } from './utils/db';
import { verifyToken } from './utils/authMiddleware';

export const handler: Handler = async (event) => {
  const user = verifyToken(event);
  if (!user) return { statusCode: 401, body: 'Unauthorized' };

  try {
    const { requirementId, propertyId } = event.queryStringParameters || {};

    if (requirementId) {
      // Find matching properties for a requirement
      const reqResult = await query('SELECT * FROM BuyerRequirements WHERE Id = $1', [requirementId]);
      if (reqResult.rows.length === 0) return { statusCode: 404, body: 'Requirement Not Found' };
      const req = reqResult.rows[0];

      // Logic for matching:
      // 1. Same Operation Type
      // 2. Price within range
      // 3. Area >= min
      // 4. Rooms/Bathrooms >= min
      // 5. Features (Elevator, Parking)
      
      const sql = `
        SELECT p.*, 
          (SELECT ImageUrl FROM PropertyImages WHERE PropertyId = p.Id ORDER BY Orden LIMIT 1) as mainimage,
          (
            (CASE WHEN p.Price BETWEEN $2 AND $3 THEN 40 ELSE 0 END) +
            (CASE WHEN p.Area >= $4 THEN 20 ELSE 0 END) +
            (CASE WHEN p.Rooms >= $5 THEN 10 ELSE 0 END) +
            (CASE WHEN p.Bathrooms >= $6 THEN 10 ELSE 0 END) +
            (CASE WHEN p.HasElevator = $7 THEN 10 ELSE 0 END) +
            (CASE WHEN p.ParkingSpots > 0 AND $8 = TRUE THEN 10 ELSE 0 END)
          ) as matchscore
        FROM Properties p
        WHERE p.OperationType = $1 AND p.Status = 'Aprobada'
        ORDER BY MatchScore DESC
        LIMIT 20
      `;

      const matches = await query(sql, [
        req.operationtype, 
        req.minprice || 0, 
        req.maxprice || 999999999, 
        req.minarea || 0, 
        req.minrooms || 0, 
        req.minbathrooms || 0, 
        req.elevatorrequired || false, 
        req.parkingrequired || false
      ]);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matches.rows),
      };
    }

    if (propertyId) {
      // Find interested buyers for a property
      const propResult = await query('SELECT * FROM Properties WHERE Id = $1', [propertyId]);
      if (propResult.rows.length === 0) return { statusCode: 404, body: 'Property Not Found' };
      const prop = propResult.rows[0];

      const sql = `
        SELECT r.*, u.FirstName, u.LastName, u.Email,
          (
            (CASE WHEN $2 BETWEEN r.MinPrice AND r.MaxPrice THEN 40 ELSE 0 END) +
            (CASE WHEN $3 >= r.MinArea THEN 20 ELSE 0 END) +
            (CASE WHEN $4 >= r.MinRooms THEN 10 ELSE 0 END) +
            (CASE WHEN $5 >= r.MinBathrooms THEN 10 ELSE 0 END) +
            (CASE WHEN $6 = r.ElevatorRequired THEN 10 ELSE 0 END) +
            (CASE WHEN $7 > 0 AND r.ParkingRequired = TRUE THEN 10 ELSE 0 END)
          ) as matchscore
        FROM BuyerRequirements r
        JOIN Users u ON r.UserId = u.Id
        WHERE r.OperationType = $1
        ORDER BY MatchScore DESC
        LIMIT 20
      `;

      const matches = await query(sql, [
        prop.operationtype,
        prop.price,
        prop.area,
        prop.rooms,
        prop.bathrooms,
        prop.haselevator,
        prop.parkingspots
      ]);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matches.rows),
      };
    }

    return { statusCode: 400, body: 'Missing requirementId or propertyId' };
  } catch (error) {
    console.error('Matching Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
