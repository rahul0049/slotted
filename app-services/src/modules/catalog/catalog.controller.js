import { listProviders,getProvider,listInventory,listProviders,
  getProvider,
  listInventory,
  createVenue,
  createProvider,
  createInventory,
  listVenues, } from "./catalog.service.js";

export const listProvidersController = async (req,res)=>{
    try {
        const {type,city,upcoming}=req.query;
        const providers = await listProviders({type,city,upcoming});
        res.status(200).json({ providers });
    } catch (err) {
        res.status(err.status || 500).json({error:err.message});
    }
};
export const getProviderController = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await getProvider(id);
    res.status(200).json({ provider });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const listInventoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await listInventory(id);
    res.status(200).json({ inventory });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};



export const createVenueController = async (req, res) => {
  try {
    const { name, city, address } = req.body;
    const venue = await createVenue({ name, city, address });
    res.status(201).json({ venue });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createProviderController = async (req, res) => {
  try {
    const { name, type, venueId, saleStartsAt, eventAt, metadata } = req.body;
    const provider = await createProvider({
      name, type, venueId, saleStartsAt, eventAt, metadata,
    });
    res.status(201).json({ provider });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const createInventoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { units } = req.body;
    const inventory = await createInventory(id, units);
    res.status(201).json({ inventory });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const listVenuesController = async (req, res) => {
  try {
    const venues = await listVenues();
    res.status(200).json({ venues });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};