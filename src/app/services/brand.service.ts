import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment.dev';
import { Brand } from '@app/common/interface/brand.interface';

@Injectable({
	providedIn: 'root',
})
export class BrandService {
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
	) {}

	create_brand(brand: any): Observable<any> {
		let data = new FormData();
		data.append('name', brand.name || '');
		data.append('country', JSON.stringify(brand.country));
		data.append('description', brand.description || '');
		data.append('websiteUrl', brand.websiteUrl || '');
		data.append('logoUrl', brand.logoUrl);
		data.append('bannerUrl', brand.bannerUrl);
		return this.http.post(`${this.apiUrl}/brand/create_brand`, data, { headers: this.getHeaders(data)});
	}

	get_brands(filter: string, page: number, limit: number, status: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/brand/get_brands?filter=${filter}&page=${page}&limit=${limit}&status=${status}`, {
			headers: this.getHeaders(),
		});
	}

	update_status_brand(id: string, data: { status: boolean }): Observable<any> {
		return this.http.put(`${this.apiUrl}/brand/update_status_brand/${id}`, data, { headers: this.getHeaders() });
	}

	get_brand(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/brand/get_brand/${id}`, { headers: this.getHeaders() });
	}

	update_brand(id: string, brand: Brand): Observable<any> {
		let data;
		if (brand.logoUrl || brand.bannerUrl) {
			data = new FormData();
			data.append('id', brand.id);
			data.append('name', brand.name);
			data.append('country', JSON.stringify(brand.country));
			data.append('description', brand.description);
			data.append('websiteUrl', brand.websiteUrl);
			if (brand.logoUrl) data.append('logoUrl', brand.logoUrl);
			if (brand.bannerUrl) data.append('bannerUrl', brand.bannerUrl);
		} else {
			data = brand;
		}

		return this.http.put(`${this.apiUrl}/brand/update_brand/${id}`, data, { headers: this.getHeaders(data) });
	}

	get_brands_by_select(): Observable<any> {
		return this.http.get(`${this.apiUrl}/brand/get_brands_by_select`, { headers: this.getHeaders() });
	}
}
