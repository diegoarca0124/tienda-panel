import { CategoryInterface } from "../interfaces/category.interface";
import { SubcategoryInterface } from "../interfaces/subcategory.interface";
import { UpdatesCatsubcatProductsInterface } from "../interfaces/update-catsubcat.products.interface";


export function createEmptyCategory(): CategoryInterface {
    return {
        name: '',
		slug: '',
		icon: '',
		prefix: '',
		description: '',
		isDimensions: false,
		isCharacteristics: false,
		isConditiom: false,
		isWarranty: false,
		isCountryOfOrigin: false,
		isMaterial: false,
		isTemperature: false,	
    };
}

export function createEmptySubcategory(): SubcategoryInterface {
    return {
        name: '',
		prefix: '',
		icon: '',
		categoryId: '',
    };
}

export function createUpdateCatsubcatProducts(): UpdatesCatsubcatProductsInterface {
	return {
        products: [],
		categoryId: '',
		subcategoryId: ''
    };
}
