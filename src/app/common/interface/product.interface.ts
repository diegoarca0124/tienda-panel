export interface Product {
	id?: string;
	status?: string;
	visibility: string;
	name: string;
	type: string; //Fisico  | Digital | Servicio
	slug?: string;
	description: string;
	extract: string;
	cover: File | undefined | null;
	miniature: File | undefined | null;
	mainAttribute: string | any;
	mainAttributeValue: string | undefined;
	unitOfMeasure: string | undefined;
	condition: string | undefined;
	warranty: string | undefined;
	countryOfOrigin?: any;
	priceRegular: number | string;
	priceDiscount?: number | string;
	tags: string[];
	brandId: string | undefined;
	categoryId: string | undefined;
	subcategoryId: string | undefined;
	isBestSeller: boolean,
	isNewArrival: boolean,
	isFeatured: boolean,
	isLimitedEdition: boolean,
	isPreOrder: boolean,
	isExportable: boolean,
	allowBackorder: boolean,
	productGroupId: string | undefined,
	
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;

	
	
}
