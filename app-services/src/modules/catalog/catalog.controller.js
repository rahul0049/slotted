import { listProviders,getProvider,listInventory } from "./catalog.service.js";

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