import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Store } from '@ngrx/store';

import { Router } from '@angular/router';
import { clearUserAuth } from '@app/store/auth/auth.action';

export interface ValidateTokenResponse {
	valid: boolean;
	message: string;
}

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = environment.apiUrl;

	constructor(
		private http: HttpClient,
		private store: Store,
		private router: Router
	) {}

	getToken() {
		return localStorage.getItem('token')?.toString();
	}

	clearSession(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('authUser');
		localStorage.removeItem('user');
		this.store.dispatch(clearUserAuth());
	}

	getUser() {
		return JSON.parse(localStorage.getItem('user')!);
	}

	login(auth: { email: string; password: string }): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.getToken() || ''}`,
		});
		return this.http.post(`${this.apiUrl}/collaborator/login`, auth, { headers });
	}

	validate_token(): Observable<ValidateTokenResponse> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.getToken() || ''}`,
		});
		return this.http.get<ValidateTokenResponse>(`${this.apiUrl}/collaborator/validate_token`, { headers }).pipe(timeout({ first: 10000 }));
	}

	logout(): Observable<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${this.getToken() || ''}`,
		});
		return this.http.get(`${this.apiUrl}/collaborator/logout`, { headers });
	}

	/*  */
}
