import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Collaborator } from '@app/common/interface/collaborator.interface';
import { environment } from 'environments/environment.dev';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from './auth.service';

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

	create_collaborator(collaborator: Collaborator): Observable<any> {
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

	update_collaborator(id: string, collaborator: Collaborator): Observable<any> {
		return this.http.put(`${this.apiUrl}/collaborator/update_collaborator/${id}`, collaborator, { headers: this.getHeaders() });
	}

	update_status_collaborator(id: string, data: { status: boolean }): Observable<any> {
		return this.http.put(`${this.apiUrl}/collaborator/update_status_collaborator/${id}`, data, { headers: this.getHeaders() });
	}
}
