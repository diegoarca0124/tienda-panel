import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.dev';
import { AuthService } from './auth.service';
import { Category } from '@app/common/interface/category.interface';
import { Observable } from 'rxjs';
import { Subcategory } from '@app/common/interface/subcategory.interface';

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

	create_category(category: Category): Observable<any> {
		return this.http.post(`${this.apiUrl}/category/create_category`, category, { headers: this.getHeaders() });
	}

	get_categories(filter: string, page: number, limit: number, status: string, sort : string): Observable<any> {
		return this.http.get(`${this.apiUrl}/category/get_categories?filter=${filter}&page=${page}&limit=${limit}&status=${status}&sort=${sort}`, {
			headers: this.getHeaders(),
		});
	}

	update_status_category(id: string, data: { status: boolean }): Observable<any> {
		return this.http.put(`${this.apiUrl}/category/update_status_category/${id}`, data, { headers: this.getHeaders() });
	}

	get_category(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/category/get_category/${id}`, { headers: this.getHeaders() });
	}

	update_category(id: string, category: Category): Observable<any> {
		return this.http.put(`${this.apiUrl}/category/update_category/${id}`, category, { headers: this.getHeaders() });
	}

	create_subcategory(subcategory: Subcategory): Observable<any> {
		return this.http.post(`${this.apiUrl}/category/create_subcategory`, subcategory, { headers: this.getHeaders() });
	}

	get_subcategories(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/category/get_subcategories/${id}`, { headers: this.getHeaders() });
	}

	update_status_subcategory(id: string, data: { status: boolean }): Observable<any> {
		return this.http.put(`${this.apiUrl}/category/update_status_subcategory/${id}`, data, { headers: this.getHeaders() });
	}

	update_subcategory(id: string, subcategory: Subcategory): Observable<any> {
		return this.http.put(`${this.apiUrl}/category/update_subcategory/${id}`, subcategory, { headers: this.getHeaders() });
	}

	get_categories_by_select(): Observable<any> {
		return this.http.get(`${this.apiUrl}/category/get_categories_by_select`, { headers : this.getHeaders() });
	}

	get_subcategories_by_select(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/category/get_subcategories_by_select/${id}`, { headers : this.getHeaders() });
	}

	update_status_categories(data: {ids: Array<string>, status: boolean}): Observable<any> {
		return this.http.post(`${this.apiUrl}/category/update_status_categories`, data, { headers: this.getHeaders() });
	}

	update_status_subcategories(data: {ids: Array<string>, status: boolean}): Observable<any> {
		return this.http.post(`${this.apiUrl}/category/update_status_subcategories`, data, { headers: this.getHeaders() });
	}
}
