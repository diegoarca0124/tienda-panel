export interface Product {
	id?: string;
	name: string;
	slug: string;
	type: string; //Fisico  | Digital | Servicio
	description: string;
	cover: string;
	tags?: string[];
	labels?: string[];
	onSale: boolean;
	freeShipping: boolean;
	priceRegular: number | string;
	priceDiscount: number | string;
	brandId: string;
	categoryId: string;
	subcategoryId: string;
	countryOfOrigin?: string;
	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
