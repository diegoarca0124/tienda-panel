import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.dev';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from './auth.service';
import { CollaboratorInterface } from '@app/pages/users/collaborators/interfaces/collaborator.interface';

@Injectable({
	providedIn: 'root',
})
export class CollaboratorService {
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

	create_collaborator(collaborator: CollaboratorInterface): Observable<any> {
		return this.http.post(`${this.apiUrl}/collaborator/create_collaborator`, collaborator, { headers: this.getHeaders() });
	}

	get_collaborators(filter: string, page: number, limit: number, status: string, sort: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/collaborator/get_collaborators?filter=${filter}&page=${page}&limit=${limit}&status=${status}&sort=${sort}`, {
			headers: this.getHeaders(),
		});
	}

	get_collaborator(id: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/collaborator/get_collaborator/${id}`, { headers: this.getHeaders() });
	}

	update_collaborator(id: string, collaborator: CollaboratorInterface): Observable<any> {
		return this.http.put(`${this.apiUrl}/collaborator/update_collaborator/${id}`, collaborator, { headers: this.getHeaders() });
	}

	update_status_collaborator(id: string, data: { status: boolean }): Observable<any> {
		return this.http.put(`${this.apiUrl}/collaborator/update_status_collaborator/${id}`, data, { headers: this.getHeaders() });
	}

	update_status_collaborators(data: {ids: Array<string>, status: boolean}): Observable<any> {
		return this.http.post(`${this.apiUrl}/collaborator/update_status_collaborators`, data, { headers: this.getHeaders() });
	}

	export_collaborators(data: any): Observable<any> {
		return this.http.post(`${this.apiUrl}/collaborator/export_collaborators`, data, { headers: this.getHeaders() });
	}

	validate_import_collaborators(data: any): Observable<any> {
		return this.http.post(`${this.apiUrl}/collaborator/validate_import_collaborators`, data, { headers: this.getHeaders() });
	}
}
