import { query } from "../../shared/db/index.js";
export const findProviders = async ({type,city,upcoming}={}) =>{
    const conditions = [];
    const values = [];
    let i=1;
    if(type){
        conditions.push(`p.type=$${i++}`);
        values.push(type.toUpperCase());
    }
    if(city){
        conditions.push(`v.city ILIKE $${i++}`);
        values.push(`%${city}%`);
    }
    if(upcoming==='true'){
        conditions.push(`p.sale_starts_at>NOW()`);
    } 
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
        `SELECT
            p.id, p.name,p.type,p.sale_starts_at , p.event_at, p.metadata,
            v.id AS venue_id, v.name AS venue_name , v.city, v.address 
            FROM providers p 
            JOIN venues v ON p.venue_id=v.id
            ${where}
            ORDER BY p.sale_starts_at ASC`,
            values
    );
    return result.rows;
}

export const findProviderById = async (id) => {
  const result = await query(
    `SELECT 
      p.id, p.name, p.type, p.sale_starts_at, p.event_at, p.metadata,
      v.id AS venue_id, v.name AS venue_name, v.city, v.address
     FROM providers p
     JOIN venues v ON p.venue_id = v.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const findInventoryByProvider = async (providerId)=>{
    const result = await query(
        `SELECT id,unit_type,label,price,status,metadata
        FROM inventory_units
         WHERE provider_id=$1
         ORDER BY label ASC`,
         [providerId]
    );
    return result.rows;
}