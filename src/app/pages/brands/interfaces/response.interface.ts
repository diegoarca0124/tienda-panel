import { BrandInterface } from "./data.interface";

export interface GetBrandsRESI {
    brands: BrandInterface[];
    meta: {
        totalBrands: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
    filters: {
        filter: string;
        status: 'Todos' | 'Activos' | 'Inactivos';
        sort: string;
        countries: string[];
    };
}