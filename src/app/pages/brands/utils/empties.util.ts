import { BrandInterface } from "../interfaces/brand.interface";

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