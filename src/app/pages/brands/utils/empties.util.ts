import { CategoryFieldErrors } from '@app/pages/categories/interfaces/validation.interface';
import { BrandInterface } from '../interfaces/data.interface';
import { BrandFieldErrors } from '../interfaces/validation.interface';

export function createEmptyBrand(): BrandInterface {
	return {
		name: '',
		prefix: '',
		description: '',
		country: null,
		websiteUrl: '',
		logoUrl: undefined as File | undefined,
		bannerUrl: undefined as File | undefined,
	};
}

export const createEmptyFieldErrorsBrand = (): BrandFieldErrors => ({
	name: false,
	prefix: false,
	code: false,
	description: false,
	country: false,
	websiteUrl: false,
	logoUrl: false,
	bannerUrl: false,
});
