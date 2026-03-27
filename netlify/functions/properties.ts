import { Handler } from '@netlify/functions';
import { query } from './utils/db';
import { verifyToken, isAdmin } from './utils/authMiddleware';

export const handler: Handler = async (event) => {
  const user = verifyToken(event);
  const method = event.httpMethod;

  try {
    // GET: List properties
    if (method === 'GET') {
      const { 
        id, owner, status, my, 
        operationTypeId, propertyTypeId, 
        minPrice, maxPrice, 
        districtId, rooms, bathrooms, featureIds,
        page = 1, limit = 10 
      } = event.queryStringParameters || {};
      const offset = (Number(page) - 1) * Number(limit);

      if (id) {
        const result = await query(`
          SELECT p.*, 
                 v1.Descripcion as operation_desc, v1.Codigo as operation_code,
                 v2.Descripcion as property_type_desc, v2.Codigo as property_type_code,
                 v3.Descripcion as district_desc, v3.Codigo as district_code,
                 v4.Descripcion as status_desc, v4.Codigo as status_code
          FROM Properties p
          LEFT JOIN ValoresComunes v1 ON p.OperationTypeId = v1.Id
          LEFT JOIN ValoresComunes v2 ON p.PropertyTypeId = v2.Id
          LEFT JOIN ValoresComunes v3 ON p.DistrictId = v3.Id
          LEFT JOIN ValoresComunes v4 ON p.StatusId = v4.Id
          WHERE p.Id = $1`, [id]);
          
        if (result.rows.length === 0) return { statusCode: 404, body: 'Not Found' };
        
        const images = await query('SELECT * FROM PropertyImages WHERE PropertyId = $1 ORDER BY Orden', [id]);
        const features = await query(`
          SELECT v.Id, v.Descripcion, v.Codigo 
          FROM PropertyFeatures pf
          JOIN ValoresComunes v ON pf.FeatureId = v.Id
          WHERE pf.PropertyId = $1`, [id]);

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...result.rows[0], images: images.rows, features: features.rows }),
        };
      }

      let sql = `
        SELECT p.*, 
               v1.Codigo as operation_code,
               v2.Codigo as property_type_code,
               v3.Descripcion as district_desc,
               v4.Descripcion as status_desc,
               v4.Codigo as status_code,
               (SELECT ImageUrl FROM PropertyImages WHERE PropertyId = p.Id ORDER BY Orden LIMIT 1) as mainimage 
        FROM Properties p
        LEFT JOIN ValoresComunes v1 ON p.OperationTypeId = v1.Id
        LEFT JOIN ValoresComunes v2 ON p.PropertyTypeId = v2.Id
        LEFT JOIN ValoresComunes v3 ON p.DistrictId = v3.Id
        LEFT JOIN ValoresComunes v4 ON p.StatusId = v4.Id
        WHERE 1=1`;
      const params: any[] = [];

      // Logic for filtering
      const isMySearch = my === 'true' || (owner && user && user.userId === Number(owner));
      
      if (isMySearch && user) {
        sql += ' AND p.OwnerId = $1';
        params.push(user.userId);
      } else {
        // General search or Admin search
        if (!isAdmin(user)) {
          // Find 'Aprobada' status ID
          const statusResult = await query('SELECT Id FROM ValoresComunes WHERE Tipo = \'EstadoPropiedad\' AND Codigo = \'Aprobada\'');
          const approvedId = statusResult.rows[0]?.id;
          if (approvedId) {
            sql += ' AND p.StatusId = $' + (params.length + 1);
            params.push(approvedId);
          }
        } else if (status) {
          if (isNaN(Number(status))) {
            const statusResult = await query('SELECT Id FROM ValoresComunes WHERE Tipo = \'EstadoPropiedad\' AND Codigo = $1', [status]);
            const foundStatusId = statusResult.rows[0]?.id || statusResult.rows[0]?.Id;
            if (foundStatusId) {
              sql += ' AND p.StatusId = $' + (params.length + 1);
              params.push(foundStatusId);
            } else {
              // If status name not found, force empty result or ignore?
              // Let's force empty result by adding a condition that never meets
              sql += ' AND 1=0';
            }
          } else {
            sql += ' AND p.StatusId = $' + (params.length + 1);
            params.push(Number(status));
          }
        }

        // Apply filters
        if (operationTypeId) {
          const ids = operationTypeId.split(',').map(Number);
          sql += ' AND p.OperationTypeId = ANY($' + (params.length + 1) + ')';
          params.push(ids);
        }
        if (propertyTypeId) {
          sql += ' AND p.PropertyTypeId = $' + (params.length + 1);
          params.push(Number(propertyTypeId));
        }
        if (districtId) {
          sql += ' AND p.DistrictId = $' + (params.length + 1);
          params.push(Number(districtId));
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
        if (featureIds) {
          const fIds = featureIds.split(',').map(Number).filter((fid: number) => !isNaN(fid));
          if (fIds.length > 0) {
            sql += ` AND p.Id IN (
              SELECT PropertyId 
              FROM PropertyFeatures 
              WHERE FeatureId = ANY($${params.length + 1}) 
              GROUP BY PropertyId 
              HAVING COUNT(DISTINCT FeatureId) = $${params.length + 2}
            )`;
            params.push(fIds, fIds.length);
          }
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
        operationTypeId, propertyTypeId, price, area, districtId, address, 
        rooms, bathrooms, parkingSpots, floorNumber, featureIds, 
        description, images, latitude, longitude, isAddressPublic, reference 
      } = body;

      // Find 'Pendiente' status ID
      const statusResult = await query('SELECT Id FROM ValoresComunes WHERE Tipo = \'EstadoPropiedad\' AND Codigo = \'Pendiente\'');
      const pendienteId = statusResult.rows[0]?.id || statusResult.rows[0]?.Id; // Handle case sensitivity if any

      if (!pendienteId) {
        throw new Error('No se encontró el estado "Pendiente" en ValoresComunes');
      }

      const result = await query(
        `INSERT INTO Properties (OwnerId, OperationTypeId, PropertyTypeId, Price, Area, DistrictId, Address, Rooms, Bathrooms, ParkingSpots, FloorNumber, Description, StatusId, Latitude, Longitude, IsAddressPublic, Reference)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
        [user.userId, Number(operationTypeId), Number(propertyTypeId), Number(price), Number(area), Number(districtId), address, rooms, bathrooms, parkingSpots, floorNumber, description, pendienteId, latitude, longitude, isAddressPublic !== undefined ? isAddressPublic : true, reference]
      );

      const propertyId = result.rows[0].id;
      
      // Handle Features
      if (featureIds && Array.isArray(featureIds)) {
        for (const featureId of featureIds) {
          await query('INSERT INTO PropertyFeatures (PropertyId, FeatureId) VALUES ($1, $2)', [propertyId, featureId]);
        }
      }

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
      const isOwner = existing.rows[0].ownerid === user.userId;
      if (!isOwner && !isAdmin(user)) return { statusCode: 403, body: 'Forbidden' };

      const body = JSON.parse(event.body || '{}');
      
      // Handle Status Update (using ID or Name)
      const statusUpdate = body.statusId || body.status;
      if (statusUpdate && (isAdmin(user) || isOwner)) {
        let targetStatusId = statusUpdate;
        if (isNaN(Number(statusUpdate))) {
          const statusResult = await query('SELECT Id FROM ValoresComunes WHERE Tipo = \'EstadoPropiedad\' AND Codigo = $1', [statusUpdate]);
          targetStatusId = statusResult.rows[0]?.id || statusResult.rows[0]?.Id;
        }
        if (targetStatusId) {
          await query('UPDATE Properties SET StatusId = $1, UpdatedAt = CURRENT_TIMESTAMP WHERE Id = $2', [Number(targetStatusId), id]);
          return { statusCode: 200, body: 'Status Updated' };
        }
      } 
      
      // Handle Full Update
      const { operationTypeId, propertyTypeId, price, area, districtId, address, rooms, bathrooms, parkingSpots, floorNumber, featureIds, description, images, latitude, longitude, isAddressPublic, reference } = body;
      
      // Find 'Pendiente' status ID for full updates (reset status)
      const statusRes = await query('SELECT Id FROM ValoresComunes WHERE Tipo = \'EstadoPropiedad\' AND Codigo = \'Pendiente\'');
      const pendienteId = statusRes.rows[0]?.id || statusRes.rows[0]?.Id;

      await query(
        `UPDATE Properties SET OperationTypeId = $1, PropertyTypeId = $2, Price = $3, Area = $4, DistrictId = $5, Address = $6, Rooms = $7, Bathrooms = $8, ParkingSpots = $9, FloorNumber = $10, Description = $11, StatusId = $12, Latitude = $13, Longitude = $14, IsAddressPublic = $15, Reference = $16, UpdatedAt = CURRENT_TIMESTAMP
          WHERE Id = $17`,
        [Number(operationTypeId), Number(propertyTypeId), Number(price), Number(area), Number(districtId), address, Number(rooms), Number(bathrooms), Number(parkingSpots), Number(floorNumber), description, pendienteId, latitude, longitude, isAddressPublic !== undefined ? isAddressPublic : true, reference, id]
      );

      // Update Features
      if (featureIds && Array.isArray(featureIds)) {
        await query('DELETE FROM PropertyFeatures WHERE PropertyId = $1', [id]);
        for (const featureId of featureIds) {
          await query('INSERT INTO PropertyFeatures (PropertyId, FeatureId) VALUES ($1, $2)', [id, featureId]);
        }
      }

      if (images && Array.isArray(images)) {
        await query('DELETE FROM PropertyImages WHERE PropertyId = $1', [id]);
        for (let i = 0; i < Math.min(images.length, 10); i++) {
          await query('INSERT INTO PropertyImages (PropertyId, ImageUrl, Orden) VALUES ($1, $2, $3)', [id, images[i], i]);
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
