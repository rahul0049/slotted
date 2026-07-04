export const transformProvider = (row)=>({
    id:row.id,
    name:row.name,
    type:row.type,
    saleStartsAt:row.sale_starts_at,
    eventAt:row.event_at,
    metadata:row.metadata?? {},
    venue:{
        id:row.venue_id,
        name:row.venue_name,
        city:row.city,
        address:row.address,
    },
});

export const transformInventoryUnits = (unit) =>{
    const base = {
        id:unit.id,
        label:unit.label,
        price:unit.price,
        status:unit.status,
        unitType:unit.unit_type,
    };
    switch(unit.unit_type){
        case 'SEAT':
            return {
                ...base,
                seat:{
                    row:unit.metadata?.row??null,
                    column:unit.metadata?.column??null,
                    section:unit.metadata?.section??null,
                },
            };
        case 'TABLE_SLOT':
            return {
                ...base,
                table:{
                    slotTime:unit.metadata?.slot_time??null,
                    tableSize:unit.metadata?.table_size??null,
                },
            };
        default:
            return {...base, metadata:unit.metadata};
    }
};