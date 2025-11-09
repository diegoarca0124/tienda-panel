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
	private getHeaders(): HttpHeaders {
		return new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.authService.getToken() || ''}`,
		});
	}

	constructor(
		private http: HttpClient,
		private authService: AuthService
	) {}

	create_attribute(attribute: Attribute): Observable<any> {
		return this.http.post(`${this.apiUrl}/attribute/create_attribute`, attribute, { headers : this.getHeaders() });
	}

	get_attributes(filter: string, page: number, limit: number, status: string, categories: string): Observable<any> {
		return this.http.get(
			`${this.apiUrl}/attribute/get_attributes?filter=${filter}&page=${page}&limit=${limit}&status=${status}&categories=${categories}`,
			{ headers : this.getHeaders() }
		);
	}

	update_status_attribute(id: string, data: { status: boolean }): Observable<any> {
		return this.http.put(`${this.apiUrl}/attribute/update_status_attribute/${id}`, data, { headers : this.getHeaders() });
	}

	get_attribute(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attribute/${id}`, { headers : this.getHeaders() });
	}

	get_values_attribute(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_values_attribute/${id}`, { headers : this.getHeaders() });
	}

	add_value_attribute(attributeValue: any): Observable<any> {
		return this.http.post(`${this.apiUrl}/attribute/add_value_attribute`, attributeValue, { headers : this.getHeaders() });
	}

	update_attribute(id: string, attribute: Attribute): Observable<any> {
		return this.http.put(`${this.apiUrl}/attribute/update_attribute/${id}`, attribute, { headers : this.getHeaders() });
	}

	get_attributes_by_select(): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attributes_by_select`, { headers : this.getHeaders() });
	}

	get_attributeValues_by_select(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attributeValues_by_select/${id}`, { headers : this.getHeaders() });
	}
}
