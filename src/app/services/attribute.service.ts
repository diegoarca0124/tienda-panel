import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.dev';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { GetAttributesGroupsQPI } from '@app/pages/attributes/interfaces/query-params.interface';
import { CreateGroupAttributeRESI, GetAttributesGroupsRESI, UpdateAttributeGroupStatusRESI, UpdateAttributeGroupsStatusRESI } from '@app/pages/attributes/interfaces/response.interface';
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

	createAttribute(attribute: AttributeInterface): Observable<any> {
		return this.http.post(`${this.apiUrl}/attribute/createAttribute`, attribute, { headers: this.getHeaders() });
	}

	createGroupAttribute(attributeGroup: AttributeGroupInterface): Observable<CreateGroupAttributeRESI> {
		return this.http.post<CreateGroupAttributeRESI>(`${this.apiUrl}/attribute/createGroupAttribute`, attributeGroup, { headers: this.getHeaders() });
	}

	get_attributes(id: string, filter: string, page: number, status: string, limit: number, sort: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attributes/${id}?filter=${filter}&page=${page}&limit=${limit}&status=${status}&sort=${sort}`, {
			headers: this.getHeaders(),
		});
	}

	getAttributesGroups(query: GetAttributesGroupsQPI): Observable<GetAttributesGroupsRESI> {
		const params = new HttpParams()
			.set('filter', query.filter)
			.set('page', query.page)
			.set('limit', query.limit)
			.set('status', query.status)
			.set('sort', query.sort)
			.set('categories', query.categories);
		return this.http.get<GetAttributesGroupsRESI>(`${this.apiUrl}/attribute/getAttributesGroups`, { params, headers: this.getHeaders() });
	}

	updateAttributeStatus(id: string, data: { status: boolean }): Observable<any> {
		return this.http.put(`${this.apiUrl}/attribute/updateAttributeStatus/${id}`, data, { headers: this.getHeaders() });
	}

	deleteAttributeValue(id: string): Observable<any> {
		return this.http.delete(`${this.apiUrl}/attribute/deleteAttributeValue/${id}`, { headers: this.getHeaders() });
	}

	updateAttributeGroupStatus(id: string, data: { status: boolean }): Observable<UpdateAttributeGroupStatusRESI> {
		return this.http.put<UpdateAttributeGroupStatusRESI>(`${this.apiUrl}/attribute/updateAttributeGroupStatus/${id}`, data, { headers: this.getHeaders() });
	}

	getAttribute(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/getAttribute/${id}`, { headers: this.getHeaders() });
	}

	get_attribute_and_categories(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attribute_and_categories/${id}`, { headers: this.getHeaders() });
	}

	getAttributeGroup(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/getAttributeGroup/${id}`, { headers: this.getHeaders() });
	}

	getAttributeValues(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/getAttributeValues/${id}`, { headers: this.getHeaders() });
	}

	createAttributeValue(attributeValue: any): Observable<any> {
		return this.http.post(`${this.apiUrl}/attribute/createAttributeValue`, attributeValue, { headers: this.getHeaders() });
	}

	updateAttribute(id: string, attribute: AttributeInterface): Observable<any> {
		return this.http.put(`${this.apiUrl}/attribute/updateAttribute/${id}`, attribute, { headers: this.getHeaders() });
	}

	updateAttributeGroup(id: string, attribute: AttributeGroupInterface): Observable<any> {
		return this.http.put(`${this.apiUrl}/attribute/updateAttributeGroup/${id}`, attribute, { headers: this.getHeaders() });
	}

	get_attributes_by_select(): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/get_attributes_by_select`, { headers: this.getHeaders() });
	}

	getAttributesByCategory(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/attribute/getAttributesByCategory/${id}`, { headers: this.getHeaders() });
	}

	updateAttributesStatus(data: { ids: Array<string>; status: boolean }): Observable<any> {
		return this.http.post(`${this.apiUrl}/attribute/updateAttributesStatus`, data, { headers: this.getHeaders() });
	}

	updateAttributeGroupsStatus(data: { ids: Array<string>; status: boolean }): Observable<UpdateAttributeGroupsStatusRESI> {
		return this.http.post<UpdateAttributeGroupsStatusRESI>(`${this.apiUrl}/attribute/updateAttributeGroupsStatus`, data, { headers: this.getHeaders() });
	}
}
