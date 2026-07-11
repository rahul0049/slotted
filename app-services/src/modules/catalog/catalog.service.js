import { findInventoryByProvider, findProviderById, findProviders } from "./catalog.repository.js"
import { transformInventoryUnits, transformProvider } from "./catalog.transformers.js";

export const listProviders = async(filters)=>{
    const rows = await findProviders(filters);
    return rows.map(transformProvider);
};

export const getProvider = async (id)=>{
    const row = await findProviderById(id);
    if(!row){
        const err = new Error('Provider not found');
        err.status = 404;
        throw err;
    }
    return transformProvider(row);
};

export const listInventory = async (providerId)=>{
    const provider = await findProviderById(providerId);
    if(!provider){
        const err = new Error('Provider not found ');
        err.status= 404;
        throw err;
    }
    const units = await findInventoryByProvider(providerId);
    return units.map(transformInventoryUnits);
}

export const createVenue = async ({ name, city, address }) => {
  if (!name || !city) {
    const err = new Error('name and city are required');
    err.status = 400;
    throw err;
  }
  return insertVenue({ name, city, address });
};

export const createProvider = async ({ name, type, venueId, saleStartsAt, eventAt, metadata }) => {
  const VALID_TYPES = ['EVENT', 'MOVIE', 'DINING', 'SPORTS'];

  if (!name || !type || !venueId || !saleStartsAt) {
    const err = new Error('name, type, venueId, saleStartsAt are required');
    err.status = 400;
    throw err;
  }

  if (!VALID_TYPES.includes(type.toUpperCase())) {
    const err = new Error(`type must be one of: ${VALID_TYPES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const venue = await findVenueById(venueId);
  if (!venue) {
    const err = new Error('Venue not found');
    err.status = 404;
    throw err;
  }

  const provider = await insertProvider({
    name,
    type: type.toUpperCase(),
    venueId,
    saleStartsAt,
    eventAt: eventAt || null,
    metadata: metadata || {},
  });

  return provider;
};

export const createInventory = async (providerId, units) => {
  if (!units?.length) {
    const err = new Error('units array is required and must not be empty');
    err.status = 400;
    throw err;
  }

  // validate every unit before inserting any
  const VALID_UNIT_TYPES = ['SEAT', 'TABLE_SLOT'];
  for (const unit of units) {
    if (!unit.unitType || !unit.label || unit.price === undefined) {
      const err = new Error('Each unit needs unitType, label, price');
      err.status = 400;
      throw err;
    }
    if (!VALID_UNIT_TYPES.includes(unit.unitType.toUpperCase())) {
      const err = new Error(`unitType must be SEAT or TABLE_SLOT`);
      err.status = 400;
      throw err;
    }
  }

  const provider = await findProviderById(providerId);
  if (!provider) {
    const err = new Error('Provider not found');
    err.status = 404;
    throw err;
  }

  return insertInventoryUnits(
    units.map(u => ({
      providerId,
      unitType: u.unitType.toUpperCase(),
      label: u.label,
      price: u.price,
      metadata: u.metadata || {},
    }))
  );
};

export const listVenues = async () => {
  return findAllVenues();
};