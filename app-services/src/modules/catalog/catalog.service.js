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