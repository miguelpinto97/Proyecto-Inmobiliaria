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
      // 1. Same Operation Type (STRICT)
      // 2. Same Property Type (STRICT)
      // 3. District (Bonus)
      // 4. Price within range (40 pts)
      // 5. Area >= min (10 pts)
      // 6. Rooms/Bathrooms >= min (5 pts each)
      // 7. Elevator/Parking (10 pts each)
      
      const sql = `
        SELECT p.*, 
          v1.Descripcion as operation_desc,
          v1.Codigo as operation_code,
          v2.Descripcion as property_type_desc,
          v2.Codigo as property_type_code,
          v3.Descripcion as district_desc,
          (SELECT ImageUrl FROM PropertyImages WHERE PropertyId = p.Id ORDER BY Orden LIMIT 1) as mainimage,
          (
            (CASE WHEN p.DistrictId = $2 THEN 20 ELSE 0 END) +
            (CASE WHEN p.Price BETWEEN $3 AND $4 THEN 40 ELSE 0 END) +
            (CASE WHEN p.Area >= $5 THEN 10 ELSE 0 END) +
            (CASE WHEN p.Rooms >= $6 THEN 5 ELSE 0 END) +
            (CASE WHEN p.Bathrooms >= $7 THEN 5 ELSE 0 END) +
            (CASE WHEN EXISTS (SELECT 1 FROM PropertyFeatures pf JOIN ValoresComunes v ON pf.FeatureId = v.Id WHERE pf.PropertyId = p.Id AND v.Codigo = 'Ascensor') AND $8 = TRUE THEN 10 ELSE 0 END) +
            (CASE WHEN p.ParkingSpots > 0 AND $9 = TRUE THEN 10 ELSE 0 END)
          ) as matchscore
        FROM Properties p
        LEFT JOIN ValoresComunes v1 ON p.OperationTypeId = v1.Id
        LEFT JOIN ValoresComunes v2 ON p.PropertyTypeId = v2.Id
        LEFT JOIN ValoresComunes v3 ON p.DistrictId = v3.Id
        WHERE p.OperationTypeId = $1 AND p.PropertyTypeId = $10
        ORDER BY MatchScore DESC
        LIMIT 20
      `;

      const matches = await query(sql, [
        req.operationtypeid,
        req.districtid,
        req.minprice || 0, 
        req.maxprice || 999999999, 
        req.minarea || 0, 
        req.minrooms || 0, 
        req.minbathrooms || 0, 
        req.elevatorrequired || false, 
        req.parkingrequired || false,
        req.propertytypeid
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
          v1.Descripcion as operation_desc,
          v2.Descripcion as property_type_desc,
          v3.Descripcion as district_desc,
          (
            (CASE WHEN $2 = r.DistrictId THEN 20 ELSE 0 END) +
            (CASE WHEN $3 BETWEEN r.MinPrice AND r.MaxPrice THEN 40 ELSE 0 END) +
            (CASE WHEN $4 >= r.MinArea THEN 10 ELSE 0 END) +
            (CASE WHEN $5 >= r.MinRooms THEN 5 ELSE 0 END) +
            (CASE WHEN $6 >= r.MinBathrooms THEN 5 ELSE 0 END) +
            (CASE WHEN $7 = TRUE AND r.ElevatorRequired = TRUE THEN 10 ELSE 0 END) +
            (CASE WHEN $8 > 0 AND r.ParkingRequired = TRUE THEN 10 ELSE 0 END)
          ) as matchscore
        FROM BuyerRequirements r
        JOIN Users u ON r.UserId = u.Id
        LEFT JOIN ValoresComunes v1 ON r.OperationTypeId = v1.Id
        LEFT JOIN ValoresComunes v2 ON r.PropertyTypeId = v2.Id
        LEFT JOIN ValoresComunes v3 ON r.DistrictId = v3.Id
        WHERE r.OperationTypeId = $1 AND r.PropertyTypeId = $9
        ORDER BY MatchScore DESC
        LIMIT 20
      `;

      // Check if property has elevator feature
      const hasElevatorResult = await query(`
        SELECT 1 FROM PropertyFeatures pf 
        JOIN ValoresComunes v ON pf.FeatureId = v.Id 
        WHERE pf.PropertyId = $1 AND v.Codigo = 'Ascensor'`, [propertyId]);
      const hasElevator = hasElevatorResult.rows.length > 0;

      const matches = await query(sql, [
        prop.operationtypeid,
        prop.districtid,
        prop.price,
        prop.area,
        prop.rooms,
        prop.bathrooms,
        hasElevator,
        prop.parkingspots,
        prop.propertytypeid
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
