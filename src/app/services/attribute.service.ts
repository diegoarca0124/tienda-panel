import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.dev';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Attribute } from '@app/common/interface/attribute.interface';

@Injectable({
	providedIn: 'root',
})
export class AttributeService {
	private apiUrl = environment.apiUrl;

	constructor(
		private http: HttpClient,
		private authService: AuthService
	) {}

	get_categories_by_select(): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.authService.getToken() || ''}`,
		});
		return this.http.get(`${this.apiUrl}/attribute/get_categories_by_select`, { headers });
	}

	create_attribute(attribute: Attribute): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.authService.getToken() || ''}`,
		});
		return this.http.post(`${this.apiUrl}/attribute/create_attribute`, attribute, { headers });
	}

	get_attributes(filter: string, page: number, limit: number, status: string, categories: string): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.authService.getToken() || ''}`,
		});
		return this.http.get(
			`${this.apiUrl}/attribute/get_attributes?filter=${filter}&page=${page}&limit=${limit}&status=${status}&categories=${categories}`,
			{ headers }
		);
	}

	update_status_attribute(id: string, data: { status: boolean }): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.authService.getToken() || ''}`,
		});
		return this.http.put(`${this.apiUrl}/attribute/update_status_attribute/${id}`, data, { headers });
	}

	get_attribute(id: string): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.authService.getToken() || ''}`,
		});
		return this.http.get(`${this.apiUrl}/attribute/get_attribute/${id}`, { headers });
	}

	get_values_attribute(id: string): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.authService.getToken() || ''}`,
		});
		return this.http.get(`${this.apiUrl}/attribute/get_values_attribute/${id}`, { headers });
	}

	add_value_attribute(attributeValue: any): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.authService.getToken() || ''}`,
		});
		return this.http.post(`${this.apiUrl}/attribute/add_value_attribute`, attributeValue, { headers });
	}

	update_attribute(id: string, attribute: Attribute): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.authService.getToken() || ''}`,
		});
		return this.http.put(`${this.apiUrl}/attribute/update_attribute/${id}`, attribute, { headers });
	}
}
