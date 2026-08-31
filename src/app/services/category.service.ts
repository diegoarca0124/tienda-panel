import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.dev';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import {
	CreateCategoryRESI,
	CreateSubcategoryRESI,
	GetCategoriesRESI,
	GetCategoriesWithSubcategoriesRESI,
	GetCategoryRESI,
	GetSubcategoriesRESI,
	MoveSubcategoryRESI,
	UpdateCategoriesStatusRESI,
	UpdateCategoryRESI,
	UpdateCategoryStatusRESI,
	UpdateSubcategoriesStatusRESI,
	UpdateSubcategoryRESI,
	UpdateSubcategoryStatusRESI,
} from '@app/pages/categories/interfaces/response.interface';

import { UpdateCategoriesStatusREQI, UpdateCategoryStatusREQI, UpdateSubcategoryStatusREQI } from '@app/pages/categories/interfaces/request.interface';
import { CategoryInterface, MoveProductsInterface, SubcategoryInterface } from '@app/pages/categories/interfaces/data.interface';
import { GetCategoriesQPI } from '@app/pages/categories/interfaces/query-params.interface';

@Injectable({
	providedIn: 'root',
})
export class CategoryService {
	private apiUrl = environment.apiUrl;
	private getHeaders(): HttpHeaders {
		return new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.authsService.getToken() || ''}`,
		});
	}

	constructor(
		private http: HttpClient,
		private authsService: AuthService
	) {}

	createCategory(category: CategoryInterface): Observable<CreateCategoryRESI> {
		return this.http.post<CreateCategoryRESI>(`${this.apiUrl}/category/createCategory`, category, { headers: this.getHeaders() });
	}

	getCategories(query: GetCategoriesQPI): Observable<GetCategoriesRESI> {
		const params = new HttpParams()
			.set('filter', query.filter)
			.set('page', query.page)
			.set('limit', query.limit)
			.set('status', query.status)
			.set('sort', query.sort)
			.set('configurations', query.configurations);

		return this.http.get<GetCategoriesRESI>(`${this.apiUrl}/category/getCategories`, { headers: this.getHeaders(), params });
	}

	updateCategoryStatus(id: string, data: UpdateCategoryStatusREQI): Observable<UpdateCategoryStatusRESI> {
		return this.http.put<UpdateCategoryStatusRESI>(`${this.apiUrl}/category/updateCategoryStatus/${id}`, data, { headers: this.getHeaders() });
	}

	updateCategoriesStatus(data: UpdateCategoriesStatusREQI): Observable<UpdateCategoriesStatusRESI> {
		return this.http.post<UpdateCategoriesStatusRESI>(`${this.apiUrl}/category/updateCategoriesStatus`, data, { headers: this.getHeaders() });
	}

	getCategory(id: string): Observable<GetCategoryRESI> {
		return this.http.get<GetCategoryRESI>(`${this.apiUrl}/category/getCategory/${id}`, { headers: this.getHeaders() });
	}

	updateCategory(id: string, category: CategoryInterface): Observable<UpdateCategoryRESI> {
		return this.http.put<UpdateCategoryRESI>(`${this.apiUrl}/category/updateCategory/${id}`, category, { headers: this.getHeaders() });
	}

	createSubcategory(subcategory: SubcategoryInterface): Observable<CreateSubcategoryRESI> {
		return this.http.post<CreateSubcategoryRESI>(`${this.apiUrl}/category/createSubcategory`, subcategory, { headers: this.getHeaders() });
	}

	getSubcategories(id: string): Observable<GetSubcategoriesRESI> {
		return this.http.get<GetSubcategoriesRESI>(`${this.apiUrl}/category/getSubcategories/${id}`, { headers: this.getHeaders() });
	}

	updateSubcategoryStatus(id: string, data: UpdateSubcategoryStatusREQI): Observable<UpdateSubcategoryStatusRESI> {
		return this.http.put<UpdateSubcategoryStatusRESI>(`${this.apiUrl}/category/updateSubcategoryStatus/${id}`, data, { headers: this.getHeaders() });
	}

	updateSubcategory(id: string, subcategory: SubcategoryInterface): Observable<UpdateSubcategoryRESI> {
		return this.http.put<UpdateSubcategoryRESI>(`${this.apiUrl}/category/updateSubcategory/${id}`, subcategory, { headers: this.getHeaders() });
	}

	findCategoryProducts(
		id: string,
		qp: {
			filter: string;
			page: number;
			limit: number;
			status: string;
			sort: string;
			subcategoryIds: string;
			quality: string;
			visibility: string;
			minPrice: number | null;
			maxPrice: number | null;
		}
	): Observable<any> {
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

		return this.http.get(`${this.apiUrl}/category/findCategoryProducts/${id}`, { params, headers: this.getHeaders() });
	}

	getCategoriesWithSubcategories(): Observable<GetCategoriesWithSubcategoriesRESI> {
		return this.http.get<GetCategoriesWithSubcategoriesRESI>(`${this.apiUrl}/category/getCategoriesWithSubcategories`, { headers: this.getHeaders() });
	}

	update_catsubcat_products(data: MoveProductsInterface): Observable<any> {
		return this.http.post(`${this.apiUrl}/category/update_catsubcat_products`, data, { headers: this.getHeaders() });
	}

	get_categories_by_select(): Observable<any> {
		return this.http.get(`${this.apiUrl}/category/get_categories_by_select`, { headers: this.getHeaders() });
	}

	get_subcat_by_select(): Observable<any> {
		return this.http.get(`${this.apiUrl}/category/get_subcat_by_select`, { headers: this.getHeaders() });
	}

	get_subcategories_by_select(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/category/get_subcategories_by_select/${id}`, { headers: this.getHeaders() });
	}

	updateSubcategoriesStatus(data: { ids: Array<string>; status: boolean }): Observable<UpdateSubcategoriesStatusRESI> {
		return this.http.post<UpdateSubcategoriesStatusRESI>(`${this.apiUrl}/category/updateSubcategoriesStatus`, data, { headers: this.getHeaders() });
	}

	moveSubcategory(id: string, data: { categoryId: string }): Observable<MoveSubcategoryRESI> {
		return this.http.put<MoveSubcategoryRESI>(`${this.apiUrl}/category/moveSubcategory/${id}`, data, { headers: this.getHeaders() });
	}
}
