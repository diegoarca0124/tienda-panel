import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment.dev';
import { GetBrandsQPI } from '@app/pages/brands/interfaces/query-params.interface';
import { BrandInterface } from '@app/pages/brands/interfaces/data.interface';
import { CreateBrandRESI, GetBrandRESI, GetBrandsRESI, UpdateBrandRESI, UpdateBrandsStatusRESI, UpdateBrandStatusRESI } from '@app/pages/brands/interfaces/response.interface';
import { FindBrandProductsREQI, UpdateBrandsStatusREQI, UpdateBrandStatusREQI } from '@app/pages/brands/interfaces/request.interface';
import { FindCategoryProductsRESI } from '@app/pages/categories/interfaces/response.interface';

@Injectable({
	providedIn: 'root',
})
export class BrandService {
	private apiUrl = environment.apiUrl;
	private getHeaders(body?: any): HttpHeaders {
		const token = this.authService.getToken() || '';
		
		if (body instanceof FormData) {
			return new HttpHeaders({
				Authorization: `Bearer ${token}`,
			});
		}

		return new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		});
	}

	constructor(
		private http: HttpClient,
		private authService: AuthService
	) {}

	createBrand(brand: any): Observable<CreateBrandRESI> {
		let data = new FormData();
		data.append('name', brand.name ?? '');
		data.append('country', JSON.stringify(brand.country));
		data.append('description', brand.description ?? '');
		data.append('websiteUrl', brand.websiteUrl ?? '');
		data.append('logoUrl', brand.logoUrl);
		data.append('prefix', brand.prefix);
		data.append('bannerUrl', brand.bannerUrl);
		return this.http.post<CreateBrandRESI>(`${this.apiUrl}/brand/createBrand`, data, { headers: this.getHeaders(data) });
	}

	getBrands(query: GetBrandsQPI): Observable<GetBrandsRESI> {
		const params = new HttpParams()
			.set('filter', query.filter)
			.set('page', query.page)
			.set('limit', query.limit)
			.set('status', query.status)
			.set('sort', query.sort)
			.set('countries', query.countries);

		return this.http.get<GetBrandsRESI>(`${this.apiUrl}/brand/getBrands`, { headers: this.getHeaders(), params });
	}

	getBrand(id: string): Observable<GetBrandRESI> {
		return this.http.get<GetBrandRESI>(`${this.apiUrl}/brand/getBrand/${id}`, { headers: this.getHeaders() });
	}

	updateBrand(id: string, brand: BrandInterface): Observable<UpdateBrandRESI> {
		let data;
		if (brand.logoUrl || brand.bannerUrl) {
			data = new FormData();
			data.append('id', brand.id);
			data.append('name', brand.name ?? '');
			data.append('country', JSON.stringify(brand.country));
			data.append('description', brand.description ?? '');
			data.append('prefix', brand.prefix);
			data.append('websiteUrl', brand.websiteUrl ?? '');
			if (brand.logoUrl) data.append('logoUrl', brand.logoUrl);
			if (brand.bannerUrl) data.append('bannerUrl', brand.bannerUrl);
		} else {
			data = brand;
		}
		return this.http.put<UpdateBrandRESI>(`${this.apiUrl}/brand/updateBrand/${id}`, data, { headers: this.getHeaders(data) });
	}

	updateBrandStatus(id: string, data: UpdateBrandStatusREQI): Observable<UpdateBrandStatusRESI> {
		return this.http.put<UpdateBrandStatusRESI>(`${this.apiUrl}/brand/updateBrandStatus/${id}`, data, { headers: this.getHeaders() });
	}
	
	updateBrandsStatus(data: UpdateBrandsStatusREQI): Observable<UpdateBrandsStatusRESI> {
		return this.http.post<UpdateBrandsStatusRESI>(`${this.apiUrl}/brand/updateBrandsStatus`, data, { headers: this.getHeaders() });
	}

	findBrandProducts(id: string, qp: FindBrandProductsREQI): Observable<any> {
		let params = new HttpParams()
			.set('filter', qp.filter)
			.set('page', qp.page)
			.set('limit', qp.limit)
			.set('status', qp.status)
			.set('sort', qp.sort)
			.set('subcategoryIds', qp.subcategoryIds)
			.set('quality', qp.quality)
			.set('visibility', qp.visibility);

		if (qp.minPrice != null) {
			params = params.set('minPrice', qp.minPrice);
		}

		if (qp.maxPrice != null) {
			params = params.set('maxPrice', qp.maxPrice);
		}

		return this.http.get<FindBrandProductsREQI>(`${this.apiUrl}/brand/findBrandProducts/${id}`, { params, headers: this.getHeaders() });
	}

	get_brands_by_select(): Observable<any> {
		return this.http.get(`${this.apiUrl}/brand/get_brands_by_select`, { headers: this.getHeaders() });
	}

}
