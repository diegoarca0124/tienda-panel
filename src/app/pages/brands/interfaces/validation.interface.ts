export interface BrandValidationErrors {
	name?: string[];
	prefix?: string[];
	code?: string[];
	description?: string[];
	country?: string[];
	websiteUrl?: string[];
	logoUrl?: string[];
	bannerUrl?: string[];
}

export interface BrandFieldErrors {
	name: boolean;
	prefix: boolean;
	code: boolean;
	description: boolean;
	country: boolean;
	websiteUrl: boolean;
	logoUrl: boolean;
	bannerUrl: boolean;
}
