export interface Product {
	id?: string;
	name: string;
	slug: string;
	type: string; //Fisico  | Digital | Servicio
	description: string;
	extract: string;
	mainAttribute: string | any;
	mainAttributeValue: string | undefined;
	cover: File | undefined | null;
	miniature: File | undefined | null;
	tags: string[];
	unitOfMeasure: string | undefined;
	onSale: boolean;
	freeShipping: boolean;
	priceRegular: number | string;
	priceDiscount: number | string;
	brandId: string | undefined;
	categoryId: string | undefined;
	subcategoryId: string | undefined;
	countryOfOrigin?: string;
	status?: string;
	isBestSeller: boolean,
	isNewArrival: boolean,
	isFeatured: boolean,
	isLimitedEdition: boolean,
	isPreOrder: boolean,
	isExportable: boolean,
	allowBackorder: boolean,
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
	weight: string;
	visibility: string;
	condition: string | undefined;
	warranty: string | undefined;
	
}
