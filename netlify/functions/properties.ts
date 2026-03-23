import { Handler } from '@netlify/functions';
import { query } from './utils/db';
import { verifyToken, isAdmin } from './utils/authMiddleware';

export const handler: Handler = async (event) => {
  const user = verifyToken(event);
  const method = event.httpMethod;

  try {
    // GET: List properties (public if approved, or owner's properties, or all if admin)
    if (method === 'GET') {
      const { 
        id, owner, status, my, 
        operationType: opType, propertyType, 
        minPrice, maxPrice, 
        district, rooms, bathrooms,
        page = 1, limit = 10 
      } = event.queryStringParameters || {};
      const offset = (Number(page) - 1) * Number(limit);

      if (id) {
        const result = await query('SELECT * FROM Properties WHERE Id = $1', [id]);
        if (result.rows.length === 0) return { statusCode: 404, body: 'Not Found' };
        
        const images = await query('SELECT * FROM PropertyImages WHERE PropertyId = $1 ORDER BY Orden', [id]);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...result.rows[0], images: images.rows }),
        };
      }

      let sql = 'SELECT p.*, (SELECT ImageUrl FROM PropertyImages WHERE PropertyId = p.Id ORDER BY Orden LIMIT 1) as mainimage FROM Properties p WHERE 1=1';
      const params: any[] = [];

      // Logic for filtering
      const isMySearch = my === 'true' || (owner && user && user.userId === Number(owner));
      
      if (isMySearch && user) {
        sql += ' AND p.OwnerId = $1';
        params.push(user.userId);
      } else {
        // General search or Admin search
        if (!isAdmin(user)) {
          sql += ' AND p.Status = \'Aprobada\'';
        } else if (status) {
          sql += ' AND p.Status = $' + (params.length + 1);
          params.push(status);
        }

        // Apply filters
        if (opType) {
          sql += ' AND p.OperationType = $' + (params.length + 1);
          params.push(opType);
        }
        if (propertyType) {
          sql += ' AND p.PropertyType = $' + (params.length + 1);
          params.push(propertyType);
        }
        if (district) {
          sql += ' AND p.District = $' + (params.length + 1);
          params.push(district);
        }
        if (minPrice) {
          sql += ' AND p.Price >= $' + (params.length + 1);
          params.push(Number(minPrice));
        }
        if (maxPrice) {
          sql += ' AND p.Price <= $' + (params.length + 1);
          params.push(Number(maxPrice));
        }
        if (rooms) {
          sql += ' AND p.Rooms >= $' + (params.length + 1);
          params.push(Number(rooms));
        }
        if (bathrooms) {
          sql += ' AND p.Bathrooms >= $' + (params.length + 1);
          params.push(Number(bathrooms));
        }
      }

      sql += ` ORDER BY CreatedAt DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await query(sql, params);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows),
      };
    }

    // AUTH REQUIRED BEYOND THIS POINT
    if (!user) return { statusCode: 401, body: 'Unauthorized' };

    // POST: Create property
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { 
        operationType, price, area, district, address, 
        rooms, bathrooms, parkingSpots, floorNumber, hasElevator, 
        description, images 
      } = body;

      // Profile completeness check (Fetch from DB for latest data)
      const currentUserResult = await query('SELECT Phone, Address FROM Users WHERE Id = $1', [user.userId]);
      const currentUser = currentUserResult.rows[0];

      if (!currentUser.phone || !currentUser.address) {
        return { 
          statusCode: 403, 
          body: JSON.stringify({ error: 'Completa tu perfil antes de publicar.' }) 
        };
      }
      
      // Check limits
      const userResult = await query('SELECT MaxProperties FROM Users WHERE Id = $1', [user.userId]);
      const maxProps = userResult.rows[0].maxproperties;
      const currentPropsResult = await query('SELECT COUNT(*) FROM Properties WHERE OwnerId = $1', [user.userId]);
      if (Number(currentPropsResult.rows[0].count) >= maxProps) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Property limit reached' }) };
      }

      const result = await query(
        `INSERT INTO Properties (OwnerId, OperationType, Price, Area, District, Address, Rooms, Bathrooms, ParkingSpots, FloorNumber, HasElevator, Description, Status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Pendiente') RETURNING *`,
        [user.userId, operationType, price, area, district, address, rooms, bathrooms, parkingSpots, floorNumber, hasElevator, description]
      );

      const propertyId = result.rows[0].id;
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await query(
            'INSERT INTO PropertyImages (PropertyId, ImageUrl, Orden) VALUES ($1, $2, $3)',
            [propertyId, images[i], i]
          );
        }
      }

      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows[0]),
      };
    }

    // PUT: Update property
    if (method === 'PUT') {
      const { id } = event.queryStringParameters || {};
      if (!id) return { statusCode: 400, body: 'Missing ID' };

      const existing = await query('SELECT OwnerId FROM Properties WHERE Id = $1', [id]);
      if (existing.rows.length === 0) return { statusCode: 404, body: 'Not Found' };
      if (existing.rows[0].ownerid !== user.userId && !isAdmin(user)) return { statusCode: 403, body: 'Forbidden' };

      const body = JSON.parse(event.body || '{}');
      // Admin can update status
      if (isAdmin(user) && body.status) {
        await query('UPDATE Properties SET Status = $1, UpdatedAt = CURRENT_TIMESTAMP WHERE Id = $2', [body.status, id]);
      } else {
        const { operationType, price, area, district, address, rooms, bathrooms, parkingSpots, floorNumber, hasElevator, description, images } = body;
        await query(
          `UPDATE Properties SET OperationType = $1, Price = $2, Area = $3, District = $4, Address = $5, Rooms = $6, Bathrooms = $7, ParkingSpots = $8, FloorNumber = $9, HasElevator = $10, Description = $11, Status = 'Pendiente', UpdatedAt = CURRENT_TIMESTAMP
           WHERE Id = $12`,
          [operationType, price, area, district, address, rooms, bathrooms, parkingSpots, floorNumber, hasElevator, description, id]
        );

        if (images && Array.isArray(images)) {
          await query('DELETE FROM PropertyImages WHERE PropertyId = $1', [id]);
          for (let i = 0; i < Math.min(images.length, 10); i++) {
            await query('INSERT INTO PropertyImages (PropertyId, ImageUrl, Orden) VALUES ($1, $2, $3)', [id, images[i], i]);
          }
        }
      }

      return { statusCode: 200, body: 'Updated' };
    }

    // DELETE: Delete property
    if (method === 'DELETE') {
      const { id } = event.queryStringParameters || {};
      if (!id) return { statusCode: 400, body: 'Missing ID' };

      const existing = await query('SELECT OwnerId FROM Properties WHERE Id = $1', [id]);
      if (existing.rows.length === 0) return { statusCode: 404, body: 'Not Found' };
      if (existing.rows[0].ownerid !== user.userId && !isAdmin(user)) return { statusCode: 403, body: 'Forbidden' };

      await query('DELETE FROM Properties WHERE Id = $1', [id]);
      return { statusCode: 200, body: 'Deleted' };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (error) {
    console.error('Properties Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
