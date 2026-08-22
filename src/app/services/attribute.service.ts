import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.dev';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { AttributeInterface } from '@app/pages/attributes/interfaces/attribute.interface';
import { AttributeGroupInterface } from '@app/pages/attributes/interfaces/attribute-group.interface';

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

	create_attribute(attribute: AttributeInterface): Observable<any> {
		return this.http.post(`${this.apiUrl}/attribute/create_attribute`, attribute, { headers: this.getHeaders() });
	}

	create_group_attribute(attributeGroup: AttributeGroupInterface): Observable<any> {
		return this.http.post(`${this.apiUrl}/attribute/create_group_attribute`, attributeGroup, { headers: this.getHeaders() });
	}

	get_attributes(id: string, filter: string, page: number, status: string, limit: number, sort: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attributes/${id}?filter=${filter}&page=${page}&limit=${limit}&status=${status}&sort=${sort}`, {
			headers: this.getHeaders(),
		});
	}

	get_groups_attributes(filter: string, page: number, limit: number, status: string, categories: string, sort: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_groups_attributes?filter=${filter}&page=${page}&limit=${limit}&status=${status}&categories=${categories}&sort=${sort}`, {
			headers: this.getHeaders(),
		});
	}

	update_status_attribute(id: string, data: { status: boolean }): Observable<any> {
		return this.http.put(`${this.apiUrl}/attribute/update_status_attribute/${id}`, data, { headers: this.getHeaders() });
	}

	delete_value_attribute(id: string): Observable<any> {
		return this.http.delete(`${this.apiUrl}/attribute/delete_value_attribute/${id}`, { headers: this.getHeaders() });
	}

	update_status_group_attribute(id: string, data: { status: boolean }): Observable<any> {
		return this.http.put(`${this.apiUrl}/attribute/update_status_group_attribute/${id}`, data, { headers: this.getHeaders() });
	}

	get_attribute(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attribute/${id}`, { headers: this.getHeaders() });
	}

	get_attribute_and_categories(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attribute_and_categories/${id}`, { headers: this.getHeaders() });
	}

	get_attribute_group(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attribute_group/${id}`, { headers: this.getHeaders() });
	}

	get_values_attribute(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_values_attribute/${id}`, { headers: this.getHeaders() });
	}

	add_value_attribute(attributeValue: any): Observable<any> {
		return this.http.post(`${this.apiUrl}/attribute/add_value_attribute`, attributeValue, { headers: this.getHeaders() });
	}

	update_attribute(id: string, attribute: AttributeInterface): Observable<any> {
		return this.http.put(`${this.apiUrl}/attribute/update_attribute/${id}`, attribute, { headers: this.getHeaders() });
	}

	update_attribute_group(id: string, attribute: AttributeGroupInterface): Observable<any> {
		return this.http.put(`${this.apiUrl}/attribute/update_attribute_group/${id}`, attribute, { headers: this.getHeaders() });
	}

	get_attributes_by_select(): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attributes_by_select`, { headers: this.getHeaders() });
	}

	get_attributes_by_category(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attributes_by_category/${id}`, { headers: this.getHeaders() });
	}

	update_status_attributes(data: { ids: Array<string>; status: boolean }): Observable<any> {
		return this.http.post(`${this.apiUrl}/attribute/update_status_attributes`, data, { headers: this.getHeaders() });
	}

	update_status_group_attributes(data: { ids: Array<string>; status: boolean }): Observable<any> {
		return this.http.post(`${this.apiUrl}/attribute/update_status_group_attributes`, data, { headers: this.getHeaders() });
	}
}
