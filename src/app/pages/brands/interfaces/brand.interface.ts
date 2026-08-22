export interface BrandInterface {
	id?: any;
	name: string;
	slug?: string;
	prefix: string;
	code?: number;
	description: string;
	country: string | null | any;
	websiteUrl: string;
	logoUrl?: File | undefined | null | string;
	bannerUrl?: File | undefined;
	status?: boolean;
	productsPreview?: Array<any>;
	moreProducts?: number;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
