import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.dev';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

	private apiUrl = environment.apiUrl;
		private getHeaders(body?: any): HttpHeaders {
			const token = this.authService.getToken() || '';

			// Si el body es FormData → NO PONEMOS Content-Type
			if (body instanceof FormData) {
				return new HttpHeaders({
					Authorization: `Bearer ${token}`,
				});
			}

			// Si es JSON normal → Content-Type: application/json
			return new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			});
		}

	constructor(
		private http: HttpClient,
			private authService: AuthService
	) { }

	create_product(product: any): Observable<any> {
		return this.http.post(`${this.apiUrl}/product/create_product`, product, { headers: this.getHeaders(product)});
	}

  	get_products(filter: string, page: number, limit: number, status: string, visibility: string, categories: string,brands: string, countries: string, minPrice: number | null, maxPrice: number | null): Observable<any> {
		return this.http.get(
			`${this.apiUrl}/product/get_products?filter=${filter}&page=${page}&limit=${limit}&status=${status}&visibility=${visibility}&categories=${categories}&brands=${brands}&countries=${countries}&minPrice=${minPrice}&maxPrice=${maxPrice}`,
			{ headers : this.getHeaders() }
		);
	}

	get_groups_for_create_product(filter: string): Observable<any> {
		return this.http.get(
			`${this.apiUrl}/product/get_groups_for_create_product?filter=${filter}`,
			{ headers : this.getHeaders() }
		);
	}

	import_product_for_group(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/product/import_product_for_group/${id}`, { headers: this.getHeaders() });
	}


	get_product(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/product/get_product/${id}`, { headers: this.getHeaders() });
	}

	get_variations_product(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/product/get_variations_product/${id}`, { headers: this.getHeaders() });
	}

	get_characteristics_product(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/product/get_characteristics_product/${id}`, { headers: this.getHeaders() });
	}

	get_photos_product(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/product/get_photos_product/${id}`, { headers: this.getHeaders() });
	}
}
