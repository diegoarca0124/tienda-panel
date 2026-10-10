import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.dev';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from './auth.service';
import { CollaboratorInterface } from '@app/pages/users/collaborators/interfaces/collaborator.interface';
import { GetCollaboratorsQPI } from '@app/pages/users/collaborators/interfaces/query-params.interface';
import {
	GetCollaboratorRESI,
	GetCollaboratorsRESI,
	RevokeCollaboratorSessionsRESI,
	UpdateCollaboratorRESI,
	UpdateCollaboratorsStatusRESI,
	UpdateCollaboratorStatusRESI,
} from '@app/pages/users/collaborators/interfaces/responses.interface';
import { UpdateCollaboratorsStatusREQI, UpdateCollaboratorStatusREQI } from '@app/pages/users/collaborators/interfaces/requests.interface';

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

	createCollaborator(collaborator: CollaboratorInterface): Observable<any> {
		return this.http.post(`${this.apiUrl}/collaborator/createCollaborator`, collaborator, { headers: this.getHeaders() });
	}

	getCollaborators(query: GetCollaboratorsQPI): Observable<GetCollaboratorsRESI> {
		const params = new HttpParams().set('filter', query.filter).set('page', query.page).set('limit', query.limit).set('status', query.status).set('sort', query.sort);

		return this.http.get<GetCollaboratorsRESI>(`${this.apiUrl}/collaborator/getCollaborators`, { headers: this.getHeaders(), params });
	}

	getCollaborator(id: string): Observable<GetCollaboratorRESI> {
		return this.http.get<GetCollaboratorRESI>(`${this.apiUrl}/collaborator/getCollaborator/${id}`, { headers: this.getHeaders() });
	}

	updateCollaborator(id: string, collaborator: CollaboratorInterface): Observable<UpdateCollaboratorRESI> {
		return this.http.put<UpdateCollaboratorRESI>(`${this.apiUrl}/collaborator/updateCollaborator/${id}`, collaborator, { headers: this.getHeaders() });
	}

	updateCollaboratorStatus(id: string, data: UpdateCollaboratorStatusREQI): Observable<UpdateCollaboratorStatusRESI> {
		return this.http.put<UpdateCollaboratorStatusRESI>(`${this.apiUrl}/collaborator/updateCollaboratorStatus/${id}`, data, { headers: this.getHeaders() });
	}

	updateCollaboratorsStatus(data: UpdateCollaboratorsStatusREQI): Observable<UpdateCollaboratorsStatusRESI> {
		return this.http.post<UpdateCollaboratorsStatusRESI>(`${this.apiUrl}/collaborator/updateCollaboratorsStatus`, data, { headers: this.getHeaders() });
	}

	revokeCollaboratorSessions(id: string): Observable<RevokeCollaboratorSessionsRESI> {
		return this.http.post<RevokeCollaboratorSessionsRESI>(`${this.apiUrl}/collaborator/revokeCollaboratorSessions/${id}`, {}, { headers: this.getHeaders() });
	}

	exportCollaborators(data: any): Observable<Blob> {
		return this.http.post(`${this.apiUrl}/collaborator/exportCollaborators`, data, { headers: this.getHeaders(), responseType: 'blob' }).pipe(
			catchError(async (error: HttpErrorResponse) => {
				if (!(error.error instanceof Blob)) throw error;
				let body: unknown;
				try {
					body = JSON.parse(await error.error.text());
				} catch {
					throw error;
				}
				throw new HttpErrorResponse({ error: body, headers: error.headers, status: error.status, statusText: error.statusText, url: error.url ?? undefined });
			})
		);
	}

	importCollaborators(data: any): Observable<any> {
		return this.http.post(`${this.apiUrl}/collaborator/importCollaborators`, data, { headers: this.getHeaders() });
	}
}
