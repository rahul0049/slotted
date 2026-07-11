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

export const insertProvider = async ({ name, type, venueId, saleStartsAt, eventAt, metadata }) => {
  const result = await query(
    `INSERT INTO providers (name, type, venue_id, sale_starts_at, event_at, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, type, venueId, saleStartsAt, eventAt, metadata]
  );
  return result.rows[0];
};

export const insertVenue = async ({ name, city, address }) => {
  const result = await query(
    `INSERT INTO venues (name, city, address)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, city, address]
  );
  return result.rows[0];
};

export const insertInventoryUnits = async (units) => {
  const results = [];
  for (const unit of units) {
    const result = await query(
      `INSERT INTO inventory_units (provider_id, unit_type, label, price, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [unit.providerId, unit.unitType, unit.label, unit.price, JSON.stringify(unit.metadata)]
    );
    results.push(result.rows[0]);
  }
  return results;
};

export const findVenueById = async (id) => {
  const result = await query(
    `SELECT * FROM venues WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

export const findAllVenues = async () => {
  const result = await query(`SELECT * FROM venues ORDER BY name ASC`);
  return result.rows;
};