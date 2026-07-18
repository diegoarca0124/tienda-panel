import { AttributeGroupInterface } from "../interfaces/attribute-group.interface";
import { AttributeInterface } from "../interfaces/attribute.interface";



export function createEmptyGroupAttribute(): AttributeGroupInterface {
    return {
        name: '',
		description: '',
		categories: [],
    };
}

export function createEmptyAttribute(): AttributeInterface {
    return {
        name: '',
        unit: '',
        values: []
    };
}